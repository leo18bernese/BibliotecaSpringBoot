package me.leoo.springboot.libri.libri.search;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.*;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroController;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.caratteristiche.CaratteristicaOpzione;
import me.leoo.springboot.libri.libri.caratteristiche.CaratteristicaOpzioneRepository;
import me.leoo.springboot.libri.libri.descrizione.LibroInfo;
import me.leoo.springboot.libri.libri.variante.Variante;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private CaratteristicaOpzioneRepository caratteristicheRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public RicercaLibriResponse cercaLibri(String q, Double prezzoMin, Double prezzoMax,
                                           Map<String, List<String>> filtriMultipli, Pageable pageable) {

        Specification<Libro> spec = buildLibroSpecificationMultiple(q, prezzoMin, prezzoMax, filtriMultipli);

        Page<Libro> risultatiLibri = libroRepository.findAll(spec, pageable);
        Page<LibroController.LiteBookResponse> libriResponse = risultatiLibri.map(Libro::toLiteBookResponse);

        Map<String, List<FiltroOpzione>> filtriDisponibili = calcolaFiltriDinamici(filtriMultipli);

        return new RicercaLibriResponse(libriResponse, filtriDisponibili, filtriMultipli);
    }

    private Specification<Libro> buildLibroSpecificationMultiple(String q, Double prezzoMin, Double prezzoMax,
                                                                 Map<String, List<String>> filtriMultipli) {
        Specification<Libro> spec = Specification.where(null);

        if (q != null && !q.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                Join<Libro, LibroInfo> descrizioneJoin = root.join("descrizione"); // Join con LibroInfo
                return cb.or(
                        cb.like(cb.lower(root.get("titolo")), "%" + q.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("autore").get("nome")), "%" + q.toLowerCase() + "%"), // Ricerca nell'autore
                        cb.like(cb.lower(root.get("editore")), "%" + q.toLowerCase() + "%"), // Ricerca nell'editore
                        cb.like(cb.lower(root.get("isbn")), "%" + q.toLowerCase() + "%") // Ricerca nell'ISBN
                );
            });
        }

        if (prezzoMin != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rifornimento").get("prezzo"), prezzoMin));
        }
        if (prezzoMax != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("rifornimento").get("prezzo"), prezzoMax));
        }

        // Gestione filtri multipli per caratteristica
        if (filtriMultipli != null && !filtriMultipli.isEmpty()) {
            for (Map.Entry<String, List<String>> entry : filtriMultipli.entrySet()) {
                String filtroNome = entry.getKey();
                List<String> valoriSelezionati = entry.getValue();

                if (valoriSelezionati != null && !valoriSelezionati.isEmpty()) {
                    // Verifica se è un filtro diretto del Libro
                    if (isDirectLibroField(filtroNome)) {
                        spec = spec.and(buildDirectFieldSpecification(filtroNome, valoriSelezionati));
                    } else {
                        // Gestione per attributi dinamiche
                        spec = spec.and((root, query, cb) -> {
                            // Subquery per cercare libri che corrispondono ai filtri nelle caratteristiche della descrizione
                            Subquery<Long> subqueryDesc = query.subquery(Long.class);
                            Root<Libro> subRootDesc = subqueryDesc.from(Libro.class);
                            MapJoin<LibroInfo, String, String> caratteristicheJoin = subRootDesc.join("descrizione").joinMap("caratteristiche");
                            subqueryDesc.select(subRootDesc.get("id"));
                            List<Predicate> orPredicatesDesc = new ArrayList<>();
                            for (String valore : valoriSelezionati) {
                                orPredicatesDesc.add(cb.and(
                                        cb.equal(caratteristicheJoin.key(), filtroNome),
                                        cb.equal(caratteristicheJoin.value(), valore)
                                ));
                            }
                            if (!orPredicatesDesc.isEmpty()) {
                                subqueryDesc.where(cb.or(orPredicatesDesc.toArray(new Predicate[0])));
                            }

                            // Subquery per cercare libri che hanno varianti corrispondenti ai filtri
                            Subquery<Long> subqueryVar = query.subquery(Long.class);
                            Root<Libro> subRootVar = subqueryVar.from(Libro.class);
                            Join<Libro, Variante> varianteJoin = subRootVar.join("varianti");
                            MapJoin<Variante, String, String> attributiSpecificiJoin = varianteJoin.joinMap("attributiSpecifici");
                            subqueryVar.select(subRootVar.get("id"));
                            List<Predicate> orPredicatesVar = new ArrayList<>();
                            for (String valore : valoriSelezionati) {
                                orPredicatesVar.add(cb.and(
                                        cb.equal(attributiSpecificiJoin.key(), filtroNome),
                                        cb.equal(attributiSpecificiJoin.value(), valore)
                                ));
                            }
                            if (!orPredicatesVar.isEmpty()) {
                                subqueryVar.where(cb.or(orPredicatesVar.toArray(new Predicate[0])));
                            }

                            // Il libro deve essere in una delle due subquery
                            return cb.or(
                                    root.get("id").in(subqueryDesc),
                                    root.get("id").in(subqueryVar)
                            );
                        });
                    }
                }
            }
        }
        return spec;
    }

    private boolean isDirectLibroField(String fieldName) {
        return Arrays.asList("genere", "annoPubblicazione", "numeroPagine", "lingua").contains(fieldName);
    }

    private Specification<Libro> buildDirectFieldSpecification(String fieldName, List<String> values) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (String value : values) {
                switch (fieldName) {
                    case "genere":
                    case "lingua":
                        predicates.add(cb.equal(root.get(fieldName), value));
                        break;
                    case "annoPubblicazione":
                    case "numeroPagine":
                        try {
                            Integer intValue = Integer.valueOf(value);
                            predicates.add(cb.equal(root.get(fieldName), intValue));
                        } catch (NumberFormatException e) {
                            // Ignora valori non numerici
                        }
                        break;
                }
            }

            return predicates.isEmpty() ? null : cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<String, List<FiltroOpzione>> calcolaFiltriDinamici(Map<String, List<String>> filtriAttivi) {
        Map<String, List<FiltroOpzione>> filtri = new HashMap<>();

        Map<String, CaratteristicaOpzione> metadatiMap = caratteristicheRepository.findAll().stream()
                .collect(Collectors.toMap(
                        op -> op.getNomeCaratteristica() + "::" + op.getValoreOpzione(),
                        Function.identity()
                ));

        System.out.println("got " + metadatiMap.size() + " metadati");

        // Prima ottieni tutte le attributi disponibili dinamicamente
        Set<String> caratteristicheDisponibili = ottieniCaratteristicheDisponibili();

        // Aggiungi i campi diretti del Libro
        caratteristicheDisponibili.addAll(Arrays.asList("genere", "annoPubblicazione", "numeroPagine", "lingua"));

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        for (String caratteristicaNome : caratteristicheDisponibili) {
            // Calcola filtri per ogni caratteristica, considerando gli altri filtri attivi
            Map<String, List<String>> filtriParziali = new HashMap<>(filtriAttivi);
            // Rimuovi temporaneamente i filtri per questa caratteristica per vedere tutte le opzioni
            filtriParziali.remove(caratteristicaNome);

            Specification<Libro> specParziale = buildLibroSpecificationMultiple(null, null, null, filtriParziali);

            List<FiltroOpzione> opzioni;

            if (isDirectLibroField(caratteristicaNome)) {
                opzioni = calcolaFiltriCampiDiretti(caratteristicaNome, specParziale, filtriAttivi, cb);
            } else {
                opzioni = calcolaFiltriCaratteristiche(caratteristicaNome, specParziale, filtriAttivi, metadatiMap, cb);
            }

            if (!opzioni.isEmpty()) {
                filtri.put(caratteristicaNome, opzioni);
            }
        }

        return filtri;
    }

    private List<FiltroOpzione> calcolaFiltriCampiDiretti(String fieldName, Specification<Libro> specParziale,
                                                          Map<String, List<String>> filtriAttivi, CriteriaBuilder cb) {
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Libro> root = cq.from(Libro.class);

        List<Predicate> predicates = new ArrayList<>();
        Predicate basePredicate = specParziale.toPredicate(root, cq, cb);
        if (basePredicate != null) {
            predicates.add(basePredicate);
        }

        // Aggiungi filtro per non null
        predicates.add(cb.isNotNull(root.get(fieldName)));

        cq.multiselect(root.get(fieldName), cb.count(root.get("id")))
                .groupBy(root.get(fieldName))
                .orderBy(cb.asc(root.get(fieldName)));

        cq.where(cb.and(predicates.toArray(new Predicate[0])));

        List<Tuple> results = entityManager.createQuery(cq).getResultList();
        List<String> valoriSelezionati = filtriAttivi.getOrDefault(fieldName, new ArrayList<>());

        return results.stream()
                .map(tuple -> {
                    Object valueObj = tuple.get(0);
                    String valore = valueObj != null ? valueObj.toString() : "";
                    Long conteggio = tuple.get(1, Long.class);
                    boolean selezionato = valoriSelezionati.contains(valore);

                    return new FiltroOpzione(valore, conteggio, selezionato, Collections.emptyMap());
                })
                .sorted((a, b) -> {
                    // Prima i selezionati, poi per conteggio decrescente
                    if (a.selezionato() && !b.selezionato()) return -1;
                    if (!a.selezionato() && b.selezionato()) return 1;
                    return Long.compare(b.conteggio(), a.conteggio());
                })
                .collect(Collectors.toList());
    }

    private List<FiltroOpzione> calcolaFiltriCaratteristiche(String caratteristicaNome, Specification<Libro> specParziale,
                                                             Map<String, List<String>> filtriAttivi,
                                                             Map<String, CaratteristicaOpzione> metadatiMap,
                                                             CriteriaBuilder cb) {
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Libro> root = cq.from(Libro.class);

        // Path per gli attributi della descrizione
        Join<Libro, LibroInfo> descrizioneJoin = root.join("descrizione", JoinType.LEFT);
        MapJoin<LibroInfo, String, String> attributiDescrizione = descrizioneJoin.joinMap("caratteristiche", JoinType.LEFT);

        // Path per gli attributi delle varianti
        Join<Libro, Variante> varianteJoin = root.join("varianti", JoinType.LEFT);
        MapJoin<Variante, String, String> attributiVariante = varianteJoin.joinMap("attributiSpecifici", JoinType.LEFT);


        List<Predicate> predicates = new ArrayList<>();
        Predicate basePredicate = specParziale.toPredicate(root, cq, cb);
        if (basePredicate != null) {
            predicates.add(basePredicate);
        }

        // Unione dei valori da entrambe le fonti
        Expression<String> valueExpression = cb.coalesce(attributiDescrizione.value(), attributiVariante.value());
        cq.multiselect(valueExpression, cb.countDistinct(root.get("id")))
                .groupBy(valueExpression);

        // Filtro per il nome della caratteristica su entrambe le fonti
        Predicate keyPredicateDesc = cb.equal(attributiDescrizione.key(), caratteristicaNome);
        Predicate keyPredicateVar = cb.equal(attributiVariante.key(), caratteristicaNome);
        predicates.add(cb.or(keyPredicateDesc, keyPredicateVar));

        cq.where(cb.and(predicates.toArray(new Predicate[0])));

        List<Tuple> results = entityManager.createQuery(cq).getResultList();
        List<String> valoriSelezionati = filtriAttivi.getOrDefault(caratteristicaNome, new ArrayList<>());

        return results.stream()
                .map(tuple -> {
                    String valore = tuple.get(0, String.class);
                    Long conteggio = tuple.get(1, Long.class);
                    boolean selezionato = valoriSelezionati.contains(valore);

                    String metadataKey = caratteristicaNome + "::" + valore;
                    CaratteristicaOpzione opzioneMetadata = metadatiMap.get(metadataKey);
                    Map<String, Object> metadata = (opzioneMetadata != null) ? opzioneMetadata.getMetadata() : Collections.emptyMap();

                    return new FiltroOpzione(valore, conteggio, selezionato, metadata);
                })
                .sorted((a, b) -> {
                    // Prima i selezionati, poi per conteggio decrescente
                    if (a.selezionato() && !b.selezionato()) return -1;
                    if (!a.selezionato() && b.selezionato()) return 1;
                    return Long.compare(b.conteggio(), a.conteggio());
                })
                .collect(Collectors.toList());
    }

    private Set<String> ottieniCaratteristicheDisponibili() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        Set<String> caratteristiche = new HashSet<>();

        // 1. Ottieni chiavi da libro.descrizione.attributi
        CriteriaQuery<String> cqDesc = cb.createQuery(String.class);
        Root<Libro> rootDesc = cqDesc.from(Libro.class);
        MapJoin<LibroInfo, String, String> caratteristicheJoinDesc = rootDesc.join("descrizione").joinMap("caratteristiche");
        cqDesc.select(caratteristicheJoinDesc.key()).distinct(true);
        caratteristiche.addAll(entityManager.createQuery(cqDesc).getResultList());

        // 2. Ottieni chiavi da libro.varianti.attributiSpecifici
        CriteriaQuery<String> cqVar = cb.createQuery(String.class);
        Root<Libro> rootVar = cqVar.from(Libro.class);
        Join<Libro, Variante> varianteJoin = rootVar.join("varianti");
        MapJoin<Variante, String, String> attributiSpecificiJoin = varianteJoin.joinMap("attributiSpecifici");
        cqVar.select(attributiSpecificiJoin.key()).distinct(true);
        caratteristiche.addAll(entityManager.createQuery(cqVar).getResultList());

        return caratteristiche;
    }
}
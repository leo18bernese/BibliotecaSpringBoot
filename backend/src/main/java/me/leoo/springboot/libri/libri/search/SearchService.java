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
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("titolo")), "%" + q.toLowerCase() + "%")/*,
                            cb.like(cb.lower(root.join("descrizione").get("autore")), "%" + q.toLowerCase() + "%")*/
                    )
            );
        }

        if (prezzoMin != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rifornimento").get("prezzo"), prezzoMin));
        }
        if (prezzoMax != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("rifornimento").get("prezzo"), prezzoMax));
        }

        // Gestione filtri multipli per caratteristica
        if (filtriMultipli != null && !filtriMultipli.isEmpty()) {
            List<Predicate> filtriPredicates = new ArrayList<>();

            for (Map.Entry<String, List<String>> entry : filtriMultipli.entrySet()) {
                String caratteristicaNome = entry.getKey();
                List<String> valoriSelezionati = entry.getValue();

                if (valoriSelezionati != null && !valoriSelezionati.isEmpty()) {

                    spec = spec.and((root, query, cb) -> {
                        // Usiamo una subquery per evitare join multipli che portano a risultati errati
                        Subquery<Long> subquery = query.subquery(Long.class);
                        Root<Libro> subRoot = subquery.from(Libro.class);
                        MapJoin<LibroInfo, String, String> caratteristicheJoin = subRoot.join("descrizione").joinMap("caratteristiche");
                        subquery.select(subRoot.get("id"));

                        List<Predicate> orPredicates = new ArrayList<>();
                        for (String valore : valoriSelezionati) {
                            orPredicates.add(cb.and(
                                    cb.equal(caratteristicheJoin.key(), caratteristicaNome),
                                    cb.equal(caratteristicheJoin.value(), valore)
                            ));
                        }
                        subquery.where(cb.or(orPredicates.toArray(new Predicate[0])));

                        return root.get("id").in(subquery);
                    });
                }
            }
        }
        return spec;
    }

    private Map<String, List<FiltroOpzione>> calcolaFiltriDinamici(Map<String, List<String>> filtriAttivi) {
        Map<String, List<FiltroOpzione>> filtri = new HashMap<>();

        Map<String, CaratteristicaOpzione> metadatiMap = caratteristicheRepository.findAll().stream()
                .collect(Collectors.toMap(
                        op -> op.getNomeCaratteristica() + "::" + op.getValoreOpzione(),
                        Function.identity()
                ));

        // Prima ottieni tutte le caratteristiche disponibili dinamicamente
        Set<String> caratteristicheDisponibili = ottieniCaratteristicheDisponibili();

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        for (String caratteristicaNome : caratteristicheDisponibili) {
            // Calcola filtri per ogni caratteristica, considerando gli altri filtri attivi
            Map<String, List<String>> filtriParziali = new HashMap<>(filtriAttivi);
            // Rimuovi temporaneamente i filtri per questa caratteristica per vedere tutte le opzioni
            filtriParziali.remove(caratteristicaNome);

            Specification<Libro> specParziale = buildLibroSpecificationMultiple(null, null, null, filtriParziali);

            CriteriaQuery<Tuple> cq = cb.createTupleQuery();
            Root<Libro> root = cq.from(Libro.class);
            MapJoin<LibroInfo, String, String> caratteristicheJoin = root.join("descrizione").joinMap("caratteristiche");

            List<Predicate> predicates = new ArrayList<>();
            Predicate basePredicate = specParziale.toPredicate(root, cq, cb);
            if (basePredicate != null) {
                predicates.add(basePredicate);
            }

            cq.multiselect(caratteristicheJoin.value(), cb.count(root.get("id")))
                    .groupBy(caratteristicheJoin.value())
                    .orderBy(cb.asc(caratteristicheJoin.value()));

            Predicate caratteristicaKeyPredicate = cb.equal(caratteristicheJoin.key(), caratteristicaNome);
            predicates.add(caratteristicaKeyPredicate);
            cq.where(cb.and(predicates.toArray(new Predicate[0])));

            List<Tuple> results = entityManager.createQuery(cq).getResultList();

            List<String> valoriSelezionati = filtriAttivi.getOrDefault(caratteristicaNome, new ArrayList<>());

            List<FiltroOpzione> opzioni = results.stream()
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

            if (!opzioni.isEmpty()) {
                filtri.put(caratteristicaNome, opzioni);
            }
        }

        return filtri;
    }

    private Set<String> ottieniCaratteristicheDisponibili() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<String> cq = cb.createQuery(String.class);
        Root<Libro> root = cq.from(Libro.class);
        MapJoin<LibroInfo, String, String> caratteristicheJoin = root.join("descrizione").joinMap("caratteristiche");

        cq.select(caratteristicheJoin.key()).distinct(true);

        List<String> caratteristiche = entityManager.createQuery(cq).getResultList();

        return new HashSet<>(caratteristiche);
    }
}

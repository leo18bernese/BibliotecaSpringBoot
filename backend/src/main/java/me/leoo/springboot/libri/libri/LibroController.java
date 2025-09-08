package me.leoo.springboot.libri.libri;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.carrello.CarrelloService;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.libri.autore.AutoreRepository;
import me.leoo.springboot.libri.libri.autore.AutoreService;
import me.leoo.springboot.libri.libri.descrizione.LibroDimension;
import me.leoo.springboot.libri.libri.search.RicercaLibriResponse;
import me.leoo.springboot.libri.libri.search.SearchService;
import me.leoo.springboot.libri.libri.variante.Variante;
import me.leoo.springboot.libri.utils.Sconto;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/libri")
@RequiredArgsConstructor
public class LibroController {

    private final LibroRepository libroRepository;
    private final SearchService searchService;
    private final AutoreRepository autoreRepository;
    private final AutoreService autoreService;
    private final CarrelloService carrelloService;

    // DTO per le risposte
    public record LiteBookResponse(Long libroId, String titolo, String autore, String editore, int annoPubblicazione,
                                   double prezzoOriginale, double prezzo,
                                   Sconto sconto) {
    }

    // DTO per update
    public record UpdateLibroRequest(String titolo, String autore, String genere, int annoPubblicazione,
                                     int numeroPagine, String editore, String lingua, String isbn,
                                     LibroDimension dimensioni,
                                     String descrizione,
                                     Map<String, String> caratteristiche) {
    }

    // DTO per rifornimento
    public record PriceRequest(double prezzo, Sconto sconto, Map<Long, Integer> prenotatiMap) {
    }

    public record RifornimentoRequest(double prezzo, int quantita, Sconto sconto, int giorniConsegna,
                                      Date prossimoRifornimento,
                                      @Nullable Map<Long, Integer> prenotatiMap) {
    }

    // Tutti i libri
    @GetMapping
    public Iterable<Libro> getLibri() {
        return libroRepository.findAll();
    }

    // ID
    @GetMapping("/{id}")
    public ResponseEntity<Libro> getLibroById(@PathVariable Long id) {

        Optional<Libro> libroOptional = libroRepository.findById(id);
        if (libroOptional.isEmpty()) {
            return ResponseEntity.noContent().build();
        }


        try {
            Libro libro = libroOptional.get();

            return ResponseEntity.ok(libro);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

       /* return libroRepository.findById(id)
                .orElse(null);
                //.orElseThrow(() -> new RuntimeException("Libro non trovato"));*/
    }

    @GetMapping("/{id}/variante/{varianteId}")
    public ResponseEntity<Variante> getVarianteById(@PathVariable Long id, @PathVariable Long varianteId) {
        try {
            Libro libro = libroRepository.findById(id)
                    .orElseThrow();

            Variante variante = libro.getVariante(varianteId)
                    .orElseThrow();

            return ResponseEntity.ok(variante);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/lite/{id}")
    public ResponseEntity<LiteBookResponse> getLibroLiteById(@PathVariable Long id) {
        try {
            Libro libro = libroRepository.findById(id)
                    .orElseThrow();

            LiteBookResponse response = libro.toLiteBookResponse();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exists/{id}")
    public boolean existsLibro(@PathVariable Long id) {
        return libroRepository.existsById(id);
    }

    @GetMapping("/exists/variante/{id}")
    public boolean existsVariante(@PathVariable Long id) {
        return libroRepository.existsVarianteById(id);
    }


    // Crea libro
    @PostMapping
    public ResponseEntity<Libro> createLibro(@RequestBody Libro libro) {
        // Validazione autore
        if (libro.getAutore() == null || libro.getAutore().getNome() == null || libro.getAutore().getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Usa AutoreService per gestire l'autore con getOrCreate
        libro.setAutore(autoreService.getOrCreate(libro.getAutore()));
        Libro savedLibro = libroRepository.save(libro);

        return ResponseEntity.ok(savedLibro);
    }

    // Modifica libro
    @PutMapping("/{id}")
    public Libro updateLibro(@PathVariable Long id, @RequestBody UpdateLibroRequest request) {
        Libro libroToUpdate = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro non trovato"));

        System.out.println("Updating libro with ID: " + id);

        // Usa AutoreService per gestire l'autore con getOrCreate
        if (!libroToUpdate.getAutore().getNome().equalsIgnoreCase(request.autore())) {
            Autore autore = autoreService.getOrCreate(request.autore(), "");
            libroToUpdate.setAutore(autore);
        }

        libroToUpdate = libroToUpdate.updateFrom(request);

        System.out.println("Updated libro: " + libroToUpdate);

        return libroRepository.save(libroToUpdate);
    }

    @PutMapping("/{id}/{varianteId}/rifornimento")
    public Libro updateRifornimento(@PathVariable Long id,
                                    @PathVariable Long varianteId,
                                    @RequestBody PriceRequest request) {
        Libro libroToUpdate = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro non trovato"));

        libroToUpdate.getVariante(varianteId)
                .ifPresentOrElse(v -> v.getPrezzo().updatePrice(request),
                        () -> {
                            throw new RuntimeException("Variante non trovata");
                        }
                );

        return libroRepository.save(libroToUpdate);
    }

    // hide book
    @PutMapping("/{id}/hide")
    public ResponseEntity<Libro> hideLibro(@PathVariable Long id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro non trovato"));

        libro.setHidden(true);
        libroRepository.save(libro);

        return ResponseEntity.ok(libro);
    }

    // show book
    @PutMapping("/{id}/show")
    public ResponseEntity<Libro> showLibro(@PathVariable Long id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro non trovato"));

        libro.setHidden(false);
        libroRepository.save(libro);

        return ResponseEntity.ok(libro);
    }

    // Cancella libro
    @DeleteMapping("/{id}")
    public void deleteLibro(@PathVariable Long id) {
        libroRepository.deleteById(id);
    }

    // Cerca per titolo

    @GetMapping("/search/{keyword}")
    public Iterable<Libro> searchLibri(@PathVariable String keyword,
                                       @RequestParam(required = false) boolean exact) {
        if (exact) {
            return libroRepository.findByTitoloEqualsIgnoreCase(keyword);
        } else {
            return libroRepository.findByTitoloIsContainingIgnoreCase(keyword);
        }
    }

    // Cerca per autore
    @GetMapping("/autore/{autore}")
    public Iterable<Libro> searchByAutore(@PathVariable String autore,
                                          @RequestParam(required = false) boolean exact) {
        if (exact) {
            return libroRepository.findByAutoreNome(autore);
        } else {
            return libroRepository.findByAutoreNomeContaining(autore);
        }
    }

    // Cerca per genere
    @GetMapping("/genere/{genere}")
    public Iterable<Libro> searchByGenere(@PathVariable String genere) {
        return libroRepository.findByGenere(genere);
    }

    // Advanced search
    @GetMapping("/advanced")
    public Iterable<Libro> advancedSearch(@RequestParam(required = false) String titolo,
                                          @RequestParam(required = false) String genere,
                                          @RequestParam(required = false) String autore) {
        return libroRepository.advanceSearch(titolo, genere, autore);
    }

    @GetMapping("/ricerca")
    public ResponseEntity<RicercaLibriResponse> cercaLibri(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Double prezzoMin,
            @RequestParam(required = false) Double prezzoMax,
            @RequestParam(defaultValue = "popolaritaDesc") String ordinamento,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int elementiPerPagina,
            @RequestParam Map<String, String> allParams) {

        System.out.println("pagina: " + pagina + ", elementiPerPagina: " + elementiPerPagina);

        // Estrai e gestisci filtri multipli dal formato filtro_categoria=valore1,valore2,valore3
        Map<String, List<String>> filtriMultipli = estraiFiltriMultipli(allParams);

        Pageable pageable = PageRequest.of(pagina, elementiPerPagina, getSort(ordinamento));
        RicercaLibriResponse risultati = searchService.cercaLibri(
                q, prezzoMin, prezzoMax, filtriMultipli, pageable);

        return ResponseEntity.ok(risultati);
    }

    private Map<String, List<String>> estraiFiltriMultipli(Map<String, String> allParams) {
        Map<String, List<String>> filtriMultipli = new HashMap<>();

        // Parametri standard da escludere
        Set<String> parametriStandard = Set.of("q", "prezzoMin", "prezzoMax",
                "ordinamento", "pagina", "elementiPerPagina");

        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            // Salta i parametri standard
            if (parametriStandard.contains(key)) {
                continue;
            }

            // Gestisce i filtri con formato: categoria=valore1,valore2,valore3
            List<String> valori = Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(v -> !v.isEmpty())
                    .collect(Collectors.toList());

            if (!valori.isEmpty()) {
                // Aggiungi il filtro solo se ha valori
                filtriMultipli.put(key, valori);
            }
        }

        return filtriMultipli;
    }

    private Sort getSort(String ordinamento) {
        if ("prezzo-cresc".equals(ordinamento)) {
            return Sort.by(Sort.Direction.ASC, "prezzo");
        } else if ("prezzo-desc".equals(ordinamento)) {
            return Sort.by(Sort.Direction.DESC, "prezzo");
        }
        return Sort.by(Sort.Direction.DESC, "id");
    }
}

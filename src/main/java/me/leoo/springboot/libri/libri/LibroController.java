package me.leoo.springboot.libri.libri;

import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.utils.Sconto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/libri")
public class LibroController {

    @Autowired
    private LibroRepository libroRepository;

    // DTO per le risposte
    public record LiteBookResponse(Long libroId, String titolo, String autore, int annoPubblicazione, double prezzo,
                                   Sconto sconto) {
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

    @GetMapping("/lite/{id}")
    public ResponseEntity<LiteBookResponse> getLibroLiteById(@PathVariable Long id) {
        try {
            Libro libro = libroRepository.findById(id)
                    .orElseThrow();

            LiteBookResponse response = new LiteBookResponse(
                    libro.getId(),
                    libro.getTitolo(),
                    libro.getAutore(),
                    libro.getAnnoPubblicazione(),
                    libro.getRifornimento().getPrezzoTotale(),
                    libro.getRifornimento().getSconto()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exists/{id}")
    public boolean existsLibro(@PathVariable Long id) {
        return libroRepository.existsById(id);
    }

    // Crea libro
    @PostMapping
    public Libro createLibro(@RequestBody Libro libro) {
        return libroRepository.save(libro);
    }

    // Modifica libro
    @PutMapping("/{id}")
    public Libro updateLibro(@PathVariable Long id, @RequestBody Libro libro) {
        Libro libroToUpdate = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro non trovato"));

        libroToUpdate = libroToUpdate.updateFrom(libro);

        return libroRepository.save(libroToUpdate);
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
            return libroRepository.findByAutore(autore);
        } else {
            return libroRepository.findByAutoreContaining(autore);
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
}

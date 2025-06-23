package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carrello")
public class CarrelloController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private CarrelloRepository carrelloRepository;

    @Autowired
    private CarrelloService carrelloService;

    // DTO per le risposte
    public record CarrelloItemResponse(Long libroId, String titolo, String autore, int annoPubblicazione, int quantita,
                                       Date dataAggiunta, double prezzo, Rifornimento rifornimento) {
    }

    public record CarrelloResponse(Set<CarrelloItemResponse> items, double totale, int numeroItems) {
    }

    public record ItemRequest(Long libroId, int quantita) {
    }

    // Metodo helper per mappare l'entità Carrello al DTO CarrelloResponse
    private CarrelloResponse mapToCarrelloResponse(Carrello carrello) {
        Set<CarrelloItemResponse> responseItems = carrello.getItems().stream()
                .map(item -> {
                    Libro libro = item.getLibro();

                    return new CarrelloItemResponse(
                            libro.getId(),
                            libro.getTitolo(),
                            libro.getAutore(),
                            libro.getAnnoPubblicazione(),
                            item.getQuantita(),
                            item.getAggiunta(),
                            libro.getRifornimento().getPrezzoTotale(),
                            libro.getRifornimento()
                    );
                })
                .collect(Collectors.toSet());
        return new CarrelloResponse(responseItems, carrello.getTotale(), responseItems.size());
    }

    @GetMapping
    public ResponseEntity<?> getCarrello(@AuthenticationPrincipal Utente utente) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/items")
    public ResponseEntity<?> getCarrelloItems(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(mapToCarrelloResponse(carrello).items());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero degli item del carrello: " + e.getMessage());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCarrelloAmount(@AuthenticationPrincipal Utente utente) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(carrello.getItems().size());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addLibro(@AuthenticationPrincipal Utente utente,
                                      @RequestBody ItemRequest request) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }
        try {
            Carrello carrello = carrelloService.addItemToCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'aggiunta del libro al carrello: " + e.getMessage());
        }
    }

    @DeleteMapping("/items")
    public ResponseEntity<?> removeLibro(@AuthenticationPrincipal Utente utente,
                                         @RequestBody ItemRequest request) {
        try {
            Carrello carrello = carrelloService.removeItemFromCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella rimozione del libro dal carrello: " + e.getMessage());
        }
    }

    @GetMapping("/items/{libroId}")
    public ResponseEntity<?> getLibro(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId) {
        try {
            CarrelloItem item = carrelloService.getCarrelloItem(utente, libroId);
            Libro libro = item.getLibro();

            CarrelloItemResponse response = new CarrelloItemResponse(
                    libro.getId(),
                    libro.getTitolo(),
                    libro.getAutore(),
                    libro.getAnnoPubblicazione(),
                    item.getQuantita(),
                    item.getUltimaModifica(),
                    libro.getRifornimento().getPrezzoTotale(),
                    libro.getRifornimento());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
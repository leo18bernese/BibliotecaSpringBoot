package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    // Carrello
    @GetMapping
    public ResponseEntity<Carrello> getCarrello(@AuthenticationPrincipal Utente utente) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    public record CarrelloItemResponse(Long libroId, String titolo, int quantita, double prezzo) {}

    @GetMapping("/items")
    public ResponseEntity<?> getCarrelloItems(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            Set<CarrelloItemResponse> responseItems = carrello.getItems().stream()
                    .map(item -> new CarrelloItemResponse(
                            item.getLibro().getId(),
                            item.getLibro().getTitolo(),
                            item.getQuantita(),
                            item.getLibro().getRifornimento().getPrezzoTotale()
                    ))
                    .collect(Collectors.toSet());
            return ResponseEntity.ok(responseItems);
        } catch (Exception e) {
            // Se si verifica una LazyInitializationException, questa logica di mappatura
            // dovrebbe essere spostata in un metodo transazionale nel CarrelloService.
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
        if(utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }

        try {
            System.out.println("facendo addLibro per utente: " + utente.getUsername() + " con libroId: " + request.libroId() + " e quantita: " + request.quantita());
            Carrello carrello = carrelloService.addItemToCarrello(utente, request.libroId(), request.quantita());

            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.badRequest().body("Errore nell'aggiunta del libro al carrello: " + e.getMessage());
        }
    }

    @DeleteMapping("/items")
    public ResponseEntity<Carrello> removeLibro(@AuthenticationPrincipal Utente utente, @RequestBody ItemRequest request) {
        try {
            Carrello carrello = carrelloService.removeItemFromCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/items/{libroId}")
    public ResponseEntity<CarrelloItem> getLibro(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId) {
        try {
            CarrelloItem item = carrelloService.getCarrelloItem(utente, libroId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    public record ItemRequest(Long libroId, int quantita) {
    }
}

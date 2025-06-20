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

    private static final Logger log = LoggerFactory.getLogger(CarrelloController.class);

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

    @PostMapping("/items")
    public ResponseEntity<?> addLibro(@AuthenticationPrincipal Utente utente,
                                      @RequestBody ItemRequest request) {
        System.out.println("CarrelloController: addLibro called " + request.libroId() + " " + request.quantita());

        try {
            Carrello carrello = carrelloService.addItemToCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
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

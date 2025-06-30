package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordini")
public class OrdineController {

    @Autowired
    private OrdineService ordineService;

    @GetMapping("/{id}/exists")
    public ResponseEntity<?> checkOrdineExists(@AuthenticationPrincipal Utente utente,
                                               @PathVariable String id) {
        if (utente == null) {
            return ResponseEntity.badRequest().body("Utente non autenticato.");
        }

        try {
            boolean exists = ordineService.existsOrdine(utente, Long.parseLong(id));
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero dell'ordine: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrdineById(@AuthenticationPrincipal Utente utente,
                                           @PathVariable String id) {
        if (utente == null) {
            return ResponseEntity.badRequest().body("Utente non autenticato.");
        }

        try {
            Ordine ordine = ordineService.getOrdineById(utente, Long.parseLong(id));
            return ResponseEntity.ok(ordine);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero dell'ordine: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrdini(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.badRequest().body("Utente non autenticato.");
        }

        try {
            List<Ordine> ordini = ordineService.getAllOrdini(utente);
            return ResponseEntity.ok(ordini);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero degli ordini: " + e.getMessage());
        }
    }

}

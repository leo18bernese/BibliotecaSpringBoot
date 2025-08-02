package me.leoo.springboot.libri.buono;

import me.leoo.springboot.libri.carrello.CarrelloService;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buono")
public class BuonoController {

    @Autowired
    private BuonoService buonoService;

    @Autowired
    private CarrelloService carrelloService;

    @PostMapping("/validate")
    public ResponseEntity<?> validateBuono(@AuthenticationPrincipal Utente utente,
                                           @RequestParam String codice) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Buono buono = buonoService.getBuonoByCodice(utente, codice);

            carrelloService.addCoupon(utente, buono);

            return ResponseEntity.ok(buono);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella validazione del buono: " + e.getMessage());
        }
    }
}

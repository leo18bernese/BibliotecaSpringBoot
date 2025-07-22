package me.leoo.springboot.libri.admin;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.resi.Reso;
import me.leoo.springboot.libri.resi.ResoRepository;
import me.leoo.springboot.libri.resi.ResoService;
import me.leoo.springboot.libri.resi.stato.StatoReso;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.websocket.ChatWebSocketController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/resi")
@RequiredArgsConstructor
public class AdminResoController {

    private final ResoService resoService;
    private final ResoRepository resoRepository;
    private final OrdineService ordineService;
    private final ChatWebSocketController chatWebSocketController;

    @GetMapping("/{id}/exists")
    public ResponseEntity<?> existsReso(@AuthenticationPrincipal Utente utente,
                                        @PathVariable Long id) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            boolean exists = resoService.exists(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il controllo dell'esistenza del reso: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResoById(@AuthenticationPrincipal Utente utente,
                                         @PathVariable Long id) {

        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Reso reso = resoService.getResoById(id);
            return ResponseEntity.ok(reso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reso non trovato con ID: " + id);
        }
    }

    // set new stato
    @PatchMapping("/{id}/stato")
    public ResponseEntity<?> setStatoReso(@AuthenticationPrincipal Utente utente,
                                          @PathVariable Long id,
                                          @RequestParam String stato,
                                          @RequestParam String messaggio) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        System.out.println("setStatoReso called with id: " + id + ", stato: " + stato + ", messaggio: " + messaggio);

        try {
            Reso reso = resoService.getResoById(id);

            reso.addStato(StatoReso.valueOf(stato), messaggio);
            resoRepository.save(reso);

            return ResponseEntity.ok(reso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante l'aggiornamento dello stato del reso: " + e.getMessage());
        }
    }

    @GetMapping("/stati")
    public ResponseEntity<?> getStatiReso() {
        try {
            return ResponseEntity.ok(StatoReso.values());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il recupero degli stati dei resi: " + e.getMessage());
        }
    }
}

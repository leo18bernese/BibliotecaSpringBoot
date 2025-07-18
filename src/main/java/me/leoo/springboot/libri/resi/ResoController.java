package me.leoo.springboot.libri.resi;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/resi")
@RequiredArgsConstructor
public class ResoController {

    private final ResoService resoService;
    private final OrdineService ordineService;

    public record CreaResoRequest(
            Long ordineId,
            Set<CreaResoItemRequest> items,
            MetodoRimborso metodoRimborso
    ) {
    }

    public record CreaResoItemRequest(
            Long ordineItemId,
            MotivoReso motivo,
            String descrizione,
            int quantita
    ) {
    }

    public record CreaMessaggioRequest(
            String testo,
            TipoMittente mittente,
            Set<String> allegati
    ) {
    }

    @PostMapping
    public ResponseEntity<?> creaReso(@AuthenticationPrincipal Utente utente,
                                      @RequestBody CreaResoRequest request) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            if (!ordineService.existsOrdine(utente, request.ordineId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + request.ordineId + " non trovato oppure non associato all'utente");
            }

            Reso nuovoReso = resoService.creaReso(request);
            return ResponseEntity.ok(nuovoReso);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Impossibile creare il reso per l'ordine " + request.ordineId + ": " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResoById(@AuthenticationPrincipal Utente utente,
                                         @PathVariable Long id) {

        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            if (!resoService.isAssociatedWithUtente(id, utente)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + id + " non trovato oppure non associato all'utente");
            }

            Reso reso = resoService.getResoById(id);
            return ResponseEntity.ok(reso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reso non trovato con ID: " + id);
        }
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<?> existsReso(@AuthenticationPrincipal Utente utente,
                                        @PathVariable Long id) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            boolean exists = resoService.isAssociatedWithUtente(id, utente);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il controllo dell'esistenza del reso: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllResi(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Set<Reso> resi = resoService.getAllByUtente(utente);
            return ResponseEntity.ok(resi);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il recupero dei resi: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/messaggi")
    public ResponseEntity<?> aggiungiMessaggio(@AuthenticationPrincipal Utente utente,
                                               @PathVariable Long id,
                                               @RequestBody CreaMessaggioRequest request) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            if (!resoService.isAssociatedWithUtente(id, utente)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + id + " non trovato oppure non associato all'utente");
            }

            Messaggio nuovoMessaggio = resoService.aggiungiMessaggio(id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuovoMessaggio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante l'aggiunta del messaggio al reso " + id + ": " + e.getMessage());
        }
    }

    @GetMapping("/reasons")
    public ResponseEntity<MotivoReso[]> getMotiviReso() {
        MotivoReso[] motivi = MotivoReso.values();
        return ResponseEntity.ok(motivi);
    }

    @GetMapping("/refund-methods")
    public ResponseEntity<MetodoRimborso[]> getMetodiRimborso() {
        MetodoRimborso[] metodi = MetodoRimborso.values();
        return ResponseEntity.ok(metodi);
    }
}
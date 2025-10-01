package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.resi.Reso;
import me.leoo.springboot.libri.resi.ResoController;
import me.leoo.springboot.libri.resi.ResoRepository;
import me.leoo.springboot.libri.resi.ResoService;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
import me.leoo.springboot.libri.resi.stato.StatoReso;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.websocket.ChatWebSocketController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/resi")
@RequiredArgsConstructor
public class AdminResoController {

    private final ResoService resoService;
    private final ResoRepository resoRepository;
    private final OrdineService ordineService;
    private final ChatWebSocketController chatWebSocketController;

    public record UpdateStatoRequest(StatoReso stato, String messaggio) {
    }

    public record ResoResponse(Long id, Long ordineId, int itemsCount,
                               StatoReso statoCorrente) {
    }

    @GetMapping("/light-all")
    public ResponseEntity<Page<AdminResoController.ResoResponse>> getAllLightResos(@RequestParam(defaultValue = "0") int page,
                                                                                   @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);

            Page<Reso> libros = resoRepository.findAll(pageable);
            Page<ResoResponse> resoResponses = libros.map(l -> new ResoResponse(
                    l.getId(),
                    l.getOrdine().getId(),
                    l.getItems().size(),
                    l.getStati().isEmpty() ? null :
                            l.getStati().get(l.getStati().size() - 1).getStato()
            ));

            return ResponseEntity.ok(resoResponses);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

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
                                          @RequestBody UpdateStatoRequest request) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        System.out.println("setStatoReso called with id: " + id + ", messaggio: " + request.messaggio);

        try {
            Reso reso = resoService.getResoById(id);

            reso.addStato(request.stato, request.messaggio);
            resoRepository.save(reso);

            return ResponseEntity.ok(reso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante l'aggiornamento dello stato del reso: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/quantity/{itemId}")
    public ResponseEntity<?> updateItemQuantity(@AuthenticationPrincipal Utente utente,
                                                @PathVariable Long id,
                                                @PathVariable Long itemId,
                                                @RequestParam int quantity) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        System.out.println("updateItemQuantity called with id: " + id + ", itemId: " + itemId + ", quantity: " + quantity);

        try {
            Reso reso = resoService.getResoById(id);
            reso.updateItemQuantity(itemId, quantity);
            resoRepository.save(reso);

            return ResponseEntity.ok(reso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante l'aggiornamento della quantità dell'item: " + e.getMessage());
        }
    }


    @PostMapping("/{id}/chat")
    public ResponseEntity<?> aggiungiMessaggio(@AuthenticationPrincipal Utente utente,
                                               @PathVariable Long id,
                                               @RequestBody ResoController.CreaMessaggioRequest request) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Messaggio nuovoMessaggio = resoService.aggiungiMessaggio(id, TipoMittente.OPERATORE, request);
            chatWebSocketController.notifyNewMessage(id.toString(), nuovoMessaggio);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuovoMessaggio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante l'aggiunta del messaggio al reso " + id + ": " + e.getMessage());
        }
    }

    @PostMapping("/{id}/chat/{messageId}/attachments")
    public ResponseEntity<?> aggiungiAllegatiMessaggio(@AuthenticationPrincipal Utente utente,
                                                       @PathVariable Long id,
                                                       @PathVariable Long messageId,
                                                       @RequestParam("files") List<MultipartFile> allegati) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            if (allegati == null || allegati.isEmpty()) {
                return ResponseEntity.badRequest().body("Nessun allegato fornito");
            }

            resoService.addAllegatiMessaggio(id, messageId, allegati);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Aggiunti " + allegati.size() + " allegati al messaggio con ID " + messageId + " del reso " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante l'aggiunta degli allegati al messaggio del reso " + id + ": " + e.getMessage());
        }
    }

    @GetMapping("/stati")
    public ResponseEntity<?> getStatiReso() {
        try {
            return ResponseEntity.ok(StatoReso.getUpdatableStates());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il recupero degli stati dei resi: " + e.getMessage());
        }
    }
}

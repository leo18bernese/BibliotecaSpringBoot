package me.leoo.springboot.libri.resi;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.MessaggioService;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.websocket.ChatWebSocketController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/resi")
@RequiredArgsConstructor
public class ResoController {

    private final ResoService resoService;
    private final OrdineService ordineService;
    private final ChatWebSocketController chatWebSocketController;
    private final MessaggioService messaggioService;

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
            Set<String> allegati
    ) {
    }

    public record AllegatoResponse(
            String nome,
            String contentType,
            String base64Content
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
//todo aggiungere controllo per quanti di item gia resi

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

    @PostMapping("/{id}/chat")
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

            Messaggio nuovoMessaggio = resoService.aggiungiMessaggio(id, TipoMittente.UTENTE, request);

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
            if (!resoService.isAssociatedWithUtente(id, utente)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + id + " non trovato oppure non associato all'utente");
            }

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

    // Mantieni anche l'endpoint originale per compatibilità con il frontend esistente
    @PostMapping("/{id}/chat/{messageId}/attachment")
    public ResponseEntity<?> aggiungiAllegatoMessaggio(@AuthenticationPrincipal Utente utente,
                                                       @PathVariable Long id,
                                                       @PathVariable Long messageId,
                                                       @RequestParam("file") MultipartFile allegato) {
        return aggiungiAllegatiMessaggio(utente, id, messageId, Arrays.asList(allegato));
    }

    @GetMapping("/{resoId}/chat/{messageId}/attachments/content")
    public ResponseEntity<?> getAllegatiMessaggioContent(@AuthenticationPrincipal Utente utente,
                                                         @PathVariable Long resoId,
                                                         @PathVariable Long messageId) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            // Se l'utente non è admin, controlla l'associazione con il reso
            if (!utente.isAdmin() && !resoService.isAssociatedWithUtente(resoId, utente)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + resoId + " non trovato oppure non associato all'utente");
            }

            Messaggio messaggio = resoService.getMessaggioById(messageId);
            if (messaggio == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Messaggio con ID " + messageId + " non trovato nel reso " + resoId);
            }

            List<Path> allegati = messaggioService.getMessageAllImages(resoId);

            if (allegati.isEmpty()) {
                return ResponseEntity.ok(List.of()); // Restituisci lista vuota
            }

            List<ImageUtils.FileResponse> allegatiResponse = allegati.stream()
                    .map(path -> {
                        try {
                            return ImageUtils.getFileAsBase64Response(path);
                        } catch (Exception e) {
                            throw new RuntimeException("Errore durante il recupero dell'allegato: " + e.getMessage(), e);
                        }
                    })
                    .toList();

            return ResponseEntity.ok(allegatiResponse);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body("Errore durante il recupero degli allegati del messaggio: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/chat/attachment/{path}")
    public ResponseEntity<?> getAllegatoMessaggio(@AuthenticationPrincipal Utente utente,
                                                  @PathVariable Long id,
                                                  @PathVariable String path) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            if (!utente.isAdmin() && !resoService.isAssociatedWithUtente(id, utente)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine con ID " + id + " non trovato oppure non associato all'utente");
            }

            return ImageUtils.getFileResponse(Path.of(path));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante il recupero dell'allegato del messaggio: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/chat/{messageId}/attachments/has")
    public ResponseEntity<?> hasAllegatiMessaggio(@AuthenticationPrincipal Utente utente,
                                                  @PathVariable Long id,
                                                  @PathVariable Long messageId) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Messaggio messaggio = resoService.getMessaggioById(messageId);
            if (messaggio == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Messaggio con ID " + messageId + " non trovato nel reso " + id);
            }

            boolean hasAttachments = !messaggio.getAllegati().isEmpty();
            return ResponseEntity.ok(hasAttachments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante il controllo degli allegati del messaggio: " + e.getMessage());
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
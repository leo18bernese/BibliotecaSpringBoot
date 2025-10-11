package me.leoo.springboot.libri.ordini;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.utils.PdfGeneratorService;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ordini")
@RequiredArgsConstructor
public class OrdineController {

    private final OrdineService ordineService;
    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping("/{id}/exists")
    public ResponseEntity<?> checkOrdineExists(@AuthenticationPrincipal Utente utente,
                                               @PathVariable String id) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            List<Ordine> ordini = ordineService.getAllOrdini(utente);
            return ResponseEntity.ok(ordini);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero degli ordini: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generateBookReport(@PathVariable Long id) {
        try {
            Ordine ordine = ordineService.getOrdineById(id);

            byte[] pdfBytes = pdfGeneratorService.generateOrderPdf(ordine);
            // 3. Imposta le intestazioni per il download del PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "order-" + ordine.getId() + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);


            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

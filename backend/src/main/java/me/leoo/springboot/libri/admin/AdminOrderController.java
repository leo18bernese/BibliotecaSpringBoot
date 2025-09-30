package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineRepository;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.ordini.StatoOrdine;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/order")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrdineRepository ordineRepository;
    private final OrdineService ordineService;

    public record OrderResponse(Long id, Utente utente, Date dataCreazione, Date dataModifica,
                                double sommaTotale, double prezzoFinale, double speseSpedizione, int items,
                                boolean couponUsed, StatoOrdine stato
    ) {
    }

    public record UpdateStatoRequest(StatoOrdine stato) {
    }


    @GetMapping("/light-all")
    public ResponseEntity<Page<OrderResponse>> getAllLightOrders(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Ordine> ordini = ordineRepository.findAll(pageable);

            Page<OrderResponse> orderResponses = ordini.map(l -> new OrderResponse(
                    l.getId(),
                    l.getUtente(),
                    l.getDataCreazione(),
                    l.getUltimaModifica(),
                    l.getSommaTotale(),
                    l.getPrezzoFinale(),
                    l.getSpeseSpedizione(),
                    l.getItems().size(),
                    !l.getCouponCodes().isEmpty(),
                    l.getStato()
            ));

            return ResponseEntity.ok(orderResponses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

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
                                           @PathVariable Long id) {

        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Ordine ordine = ordineService.getOrdineById(id);
            return ResponseEntity.ok(ordine);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordine non trovato con ID: " + id);
        }
    }

    // set new stato
    @PatchMapping("/{id}/stato")
    public ResponseEntity<?> setStatoOrdine(@AuthenticationPrincipal Utente utente,
                                            @PathVariable Long id,
                                            @RequestBody AdminOrderController.UpdateStatoRequest request) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Ordine ordine = ordineService.getOrdineById(id);

            ordine.updateStato(request.stato);
            ordineRepository.save(ordine);

            return ResponseEntity.ok(ordine);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante l'aggiornamento dello stato del ordine: " + e.getMessage());
        }
    }


    @GetMapping("/stati")
    public ResponseEntity<?> getStatiOrdine() {
        try {
            return ResponseEntity.ok(StatoOrdine.getUpdatableStates());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Errore durante il recupero degli stati dei resi: " + e.getMessage());
        }
    }
}

package me.leoo.springboot.libri.recensioni;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/recensioni")
@RequiredArgsConstructor
public class RecensioneController {

    private final RecensioneRepository recensioneRepository;
    private final UtenteRepository utenteRepository;

    public record RecensioneResponse(
            Recensione recensione, String username
    ) {
    }

    public record RecensionePublish(
            Long id,
            String titolo,
            String testo,
            int stelle,
            boolean approvato,
            boolean consigliato
    ) {
    }

    @GetMapping("/all/user")
    public ResponseEntity<RecensioneResponse[]> getRecensioniByUtenteId(@AuthenticationPrincipal Utente utente) {
        try {
            Set<Recensione> recensioni = recensioneRepository.findByUtenteId(utente.getId());

            RecensioneResponse[] recensioniResponse = recensioni.stream()
                    .map(this::getResponse)
                    .toArray(RecensioneResponse[]::new);

            return ResponseEntity.ok(recensioniResponse);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all/{libroId}")
    public ResponseEntity<RecensioneResponse[]> getRecensioniByLibroId(@PathVariable Long libroId) {
        try {
            Set<Recensione> recensioni = recensioneRepository.findByLibroId(libroId);

            System.out.println("Recensioni trovate per libroId " + libroId + ": " + recensioni.size());

            RecensioneResponse[] recensioniResponse = recensioni.stream()
                    .map(this::getResponse)
                    .toArray(RecensioneResponse[]::new);

            System.out.println("RecensioniResponse create: " + recensioniResponse.length);

            return ResponseEntity.ok(recensioniResponse);
        } catch (Exception e) {
            System.out.println("Errore nel recupero delle recensioni per libroId " + libroId + ": " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecensioneResponse> getRecensioneById(@PathVariable Long id) {
        try {
            Recensione recensione = recensioneRepository.findById(id)
                    .orElseThrow();

            return ResponseEntity.ok(getResponse(recensione));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}")
    public ResponseEntity<RecensioneResponse> addRecensione(@AuthenticationPrincipal Utente utente,
                                                            @RequestBody RecensionePublish publish) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Recensione recensione = new Recensione(
                    publish.id(),
                    utente.getId(),
                    publish.titolo(),
                    publish.testo(),
                    publish.stelle(),
                    publish.approvato(),
                    publish.consigliato()
            );

            Recensione savedRecensione = recensioneRepository.save(recensione);
            return ResponseEntity.ok(getResponse(savedRecensione));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/utile")
    public ResponseEntity<RecensioneResponse> markRecensioneUtile(@AuthenticationPrincipal Utente utente,
                                                                  @PathVariable Long id) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Recensione recensione = recensioneRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Recensione non trovata per ID: " + id));

            recensione.switchUtile(utente.getId());
            Recensione updatedRecensione = recensioneRepository.save(recensione);

            return ResponseEntity.ok(getResponse(updatedRecensione));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private RecensioneResponse getResponse(Recensione recensione) {
        if (recensione == null) return null;

        Utente utente = utenteRepository.findById(recensione.getUtenteId())
                .orElse(null);

        if (utente == null) return new RecensioneResponse(recensione, "Utente non trovato");

        return new RecensioneResponse(recensione, utente.getUsername());
    }
}

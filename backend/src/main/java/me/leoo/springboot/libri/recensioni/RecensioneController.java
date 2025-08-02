package me.leoo.springboot.libri.recensioni;

import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/recensioni")
public class RecensioneController {

    @Autowired
    private RecensioneRepository recensioneRepository;

    @Autowired
    private UtenteRepository utenteRepository;

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

            RecensioneResponse[] recensioniResponse = recensioni.stream()
                    .map(this::getResponse)
                    .toArray(RecensioneResponse[]::new);

            return ResponseEntity.ok(recensioniResponse);
        } catch (Exception e) {
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

    private RecensioneResponse getResponse(Recensione recensione) {
        if (recensione == null) return null;

        Utente utente = utenteRepository.findById(recensione.getUtenteId())
                .orElseThrow(() -> new RuntimeException("Utente non trovato per ID: " + recensione.getUtenteId()));

        return new RecensioneResponse(recensione, utente.getUsername());
    }
}

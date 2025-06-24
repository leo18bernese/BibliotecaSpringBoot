package me.leoo.springboot.libri.recensioni;

import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    private RecensioneResponse getResponse(Recensione recensione) {
        if (recensione == null) return null;

        Utente utente = utenteRepository.findById(recensione.getUtenteId())
                .orElseThrow(() -> new RuntimeException("Utente non trovato per ID: " + recensione.getUtenteId()));

        return new RecensioneResponse(recensione, utente.getUsername());
    }
}

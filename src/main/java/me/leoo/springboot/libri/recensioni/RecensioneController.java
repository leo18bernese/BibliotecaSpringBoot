package me.leoo.springboot.libri.recensioni;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recensioni")
public class RecensioneController {

    @Autowired
    private RecensioneRepository recensioneRepository;

    @GetMapping("/all/{libroId}")
    public ResponseEntity<Iterable<Recensione>> getRecensioniByLibroId(@PathVariable Long libroId) {
        try {
            Iterable<Recensione> recensioni = recensioneRepository.findByLibroId(libroId);

            return ResponseEntity.ok(recensioni);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recensione> getRecensioneById(@PathVariable Long id) {
        try {
            Recensione recensione = recensioneRepository.findById(id)
                    .orElseThrow();

            return ResponseEntity.ok(recensione);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

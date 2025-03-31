package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrello")
public class CarrelloController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private CarrelloRepository carrelloRepository;

    // Carrello
    @GetMapping("/{id}")
    public ResponseEntity<Carrello> getCarrello(@PathVariable Long id) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();

            Carrello carrello = carrelloRepository.findByUtente(utente).orElseThrow();
            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/add/{libroId}")
    public ResponseEntity<Carrello> addLibro(@PathVariable Long id, @PathVariable Long libroId, @RequestParam int quantita) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();
            Libro libro = libroRepository.findById(libroId).orElseThrow();

            Carrello carrello = carrelloRepository.findByUtente(utente).orElseThrow();
            carrello.addItem(libro, quantita);

            carrelloRepository.save(carrello);

            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/remove/{libroId}")
    public ResponseEntity<Carrello> removeLibro(@PathVariable Long id, @PathVariable Long libroId, @RequestParam int quantita) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();
            Libro libro = libroRepository.findById(libroId).orElseThrow();

            Carrello carrello = carrelloRepository.findByUtente(utente).orElseThrow();
            carrello.removeItem(libro, quantita);

            carrelloRepository.save(carrello);

            return ResponseEntity.ok(carrello);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/{libroId}")
    public ResponseEntity<CarrelloItem> removeLibro(@PathVariable Long id, @PathVariable Long libroId) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();
            Libro libro = libroRepository.findById(libroId).orElseThrow();

            Carrello carrello = carrelloRepository.findByUtente(utente).orElseThrow();
            CarrelloItem item = carrello.getItem(libro);


            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

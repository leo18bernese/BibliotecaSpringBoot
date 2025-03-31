package me.leoo.springboot.libri.rifornimento;

import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/rifornimento")
public class RifornimentoController {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private RifornimentoRepository rifornimentoRepository;

   /* @GetMapping("/{id}")
    public ResponseEntity<Rifornimento> getRifornimento(@PathVariable Long id) {
        log.info("Rifornimento ID: {}", id);
        try {

            Libro libro = libroRepository.findById(id).orElseThrow();

            Rifornimento rifornimento = rifornimentoRepository.findByLibro(libro).orElseThrow();

            return ResponseEntity.ok(rifornimento);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}")
    public ResponseEntity<Rifornimento> createRifornimento(@PathVariable Long id, @RequestBody Rifornimento rifornimento) {
        try {
            Libro libro = libroRepository.findById(id).orElseThrow();


            return ResponseEntity.ok(rifornimentoRepository.save(rifornimento));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rifornimento> updateRifornimento(@PathVariable Long id, @RequestBody Rifornimento rifornimento) {
        try {
            Rifornimento rifornimentoToUpdate = rifornimentoRepository.findById(id).orElseThrow();

            rifornimentoToUpdate.updateFrom(rifornimento);

            return ResponseEntity.ok(rifornimentoRepository.save(rifornimentoToUpdate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }*/
}

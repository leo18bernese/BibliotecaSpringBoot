package me.leoo.springboot.libri.utente;

import me.leoo.springboot.libri.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping("/id/{id}")
    public ResponseEntity<Utente> getUtente(@PathVariable Long id) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();

            throw new IllegalAccessException("Cannot access this resource");

            //return ResponseEntity.ok(utente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/username/{id}")
    public ResponseEntity<String> getUsernameById(@PathVariable Long id) {
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();

            return ResponseEntity.ok(utente.getUsername());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

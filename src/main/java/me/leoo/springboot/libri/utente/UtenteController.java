package me.leoo.springboot.libri.utente;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping("/id/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utente> getUtente(@PathVariable Long id) {
        System.out.println("UtenteController: getUtente called " + id);
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();

            if (!checkUtenteAccess(utente)) {
                return ResponseEntity.status(403).build();
            }

            return ResponseEntity.ok(utente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/username/{id}")
    public ResponseEntity<String> getUsernameById(@PathVariable Long id) {
        System.out.println("UtenteController: getUsernameById called " + id);
        try {
            Utente utente = utenteRepository.findById(id).orElseThrow();
            return ResponseEntity.ok(utente.getUsername());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

    }

    @GetMapping("current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUtente() {
        System.out.println("UtenteController: getCurrentUtente called");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + authentication);
            String username = authentication.getName();

            Utente utente = utenteRepository.findByUsername(username).orElseThrow();

            return ResponseEntity.ok(utente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private boolean checkUtenteAccess(Utente utente) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return utente.getUsername().equals(username);
    }
}

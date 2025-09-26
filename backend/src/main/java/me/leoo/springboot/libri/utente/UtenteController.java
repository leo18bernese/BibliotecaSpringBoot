package me.leoo.springboot.libri.utente;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private UtenteService utenteService;

    public record UpdateUserRequest(
            String nome,
            String cognome,
            String telefono
    ) {
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Utente> getUtente(@PathVariable Long id) {
        System.out.println("UtenteController: getUtente called " + id);
        try {
            Utente utente = utenteService.getUtenteById(id);

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
            Utente utente = utenteService.getUtenteById(id);

            return ResponseEntity.ok(utente.getUsername());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUtente(@AuthenticationPrincipal Utente utente) {
        System.out.println("UtenteController: getCurrentUtente called");
        if (utente == null) {
            return ResponseEntity.status(403).body("Utente non autenticato");
        }

        System.out.println(utente);

        try {
            return ResponseEntity.ok(utente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/update")
    public ResponseEntity<?> updateUtente(@AuthenticationPrincipal Utente utente,
                                          @RequestBody UpdateUserRequest request) {
        if (utente == null) {
            return ResponseEntity.status(403).body("Utente non autenticato");
        }

        try {
            Utente updatedUtente = utente.updateFrom(request);
            utenteRepository.save(updatedUtente);

            return ResponseEntity.ok(updatedUtente);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore durante l'aggiornamento dell'utente: " + e.getMessage());
        }
    }

    private boolean checkUtenteAccess(Utente utente) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return utente.getUsername().equals(username);
    }
}

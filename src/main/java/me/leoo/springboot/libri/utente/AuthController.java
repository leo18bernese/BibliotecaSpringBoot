package me.leoo.springboot.libri.utente;

import me.leoo.springboot.libri.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtenteService utenteService;

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utente utente) {
        try {
            return ResponseEntity.ok(utenteService.register(utente));

        } catch (IllegalArgumentException e) {
            Map<String, String> errore = new HashMap<>();
            errore.put("errore", e.getMessage());

            return ResponseEntity.badRequest().body(errore);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authenticationService.login(loginRequest.username(), loginRequest.password());

            Map<String, String> response = new HashMap<>();
            response.put("token", token);


            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errore = new HashMap<>();
            errore.put("errore", e.getMessage());

            return ResponseEntity.badRequest().body(errore);
        }
    }

    public record LoginRequest(String username, String password) {
    }
}

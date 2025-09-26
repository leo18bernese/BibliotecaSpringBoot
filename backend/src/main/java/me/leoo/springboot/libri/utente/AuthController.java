package me.leoo.springboot.libri.utente;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.security.AuthenticationService;
import me.leoo.springboot.libri.security.JwtService;
import me.leoo.springboot.libri.utente.security.LoginHistory;
import me.leoo.springboot.libri.utente.security.LoginHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtenteService utenteService;
    private final LoginHistoryService loginHistoryService;
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    public record LoginRequest(String username, String password) {
    }

    public record LogoutRequest(String token) {
    }

    public record RegisterRequest(String nome, String cognome, String username, String email, String password) {
    }

    public record AccessRecord(Date loginTime, Date logoutTime, String ipAddress, String userAgent) {
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {

            System.out.println(request);
            Utente utente = new Utente(request.username, request.password, request.nome, request.cognome, request.email);

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

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest logoutRequest) {
        String token = logoutRequest.token();
        System.out.println("Logout request received with token: " + token);
        try {
            // Extract the session ID from the token
            String sessionId = jwtService.extractSessionId(token);
            System.out.println("Extracted session ID: " + sessionId);


            // Update the login history record
            utenteService.updateLogoutTime(sessionId);
            System.out.println("Logout time updated for session ID: " + sessionId);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error during logout: " + e.getMessage());
        }
    }

    @GetMapping("/account-accesses")
    public ResponseEntity<?> getAccountAccesses(@AuthenticationPrincipal Utente utente,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (utente == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Page<LoginHistory> loginHistoryPage = loginHistoryService.getAll(utente.getId(), pageable);

            List<AccessRecord> accessRecords = loginHistoryPage
                    .stream()
                    .map(record -> new AccessRecord(
                            record.getLoginTime(),
                            record.getLogoutTime(),
                            record.getIpAddress(),
                            record.getUserAgent()
                    ))
                    .toList();

            // Ricrea l'oggetto Page con i dati mappati e le informazioni di paginazione originali
            Page<AccessRecord> accessRecordPage = new PageImpl<>(accessRecords,
                    pageable, loginHistoryPage.getTotalElements());

            return ResponseEntity.ok(accessRecordPage);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving access records: " + e.getMessage());
        }
    }

}

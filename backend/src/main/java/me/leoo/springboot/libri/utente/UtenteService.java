package me.leoo.springboot.libri.utente;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.utente.security.LoginHistory;
import me.leoo.springboot.libri.utente.security.LoginHistoryRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class UtenteService implements UserDetailsService {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginHistoryRepository loginHistoryRepository;

    public Utente getUtenteById(Long id) {
        return utenteRepository.findById(id).orElseThrow();
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Tenta di trovare l'utente per email
        return utenteRepository.findByEmail(identifier)
                .or(() -> utenteRepository.findByUsername(identifier)) // Se non trovato per email, tenta per username
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con username o email: " + identifier));
    }

    public boolean isRegistered(String username, String email) {
        return utenteRepository.existsByUsername(username) || utenteRepository.existsByEmail(email);
    }

    public Utente register(Utente utente) throws IllegalArgumentException {
        if (utenteRepository.existsByUsername(utente.getUsername())) {
            throw new IllegalArgumentException("Username già in uso: " + utente.getUsername());
        }

        if (utenteRepository.existsByEmail(utente.getEmail())) {
            throw new IllegalArgumentException("Email già in uso: " + utente.getEmail());
        }

        System.out.println("registering user: " + utente);

        // Encode password
        utente.setPassword(passwordEncoder.encode(utente.getPassword()));

        // Add ROLE_USER
        utente.addRuolo("ROLE_ADMIN");

        return utenteRepository.save(utente);
    }

    public void delete(String identifier) {
        // Modificato per permettere la cancellazione tramite username o email
        Utente utente = utenteRepository.findByUsername(identifier)
                .or(() -> utenteRepository.findByEmail(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + identifier));

        utenteRepository.delete(utente);
    }

    public void saveUserLoginHistory(String username, String ipAddress, String userAgent, String sessionId) {
        Utente utente = utenteRepository.findByUsername(username).orElse(null);

        System.out.println("Logging login for user: " + username + " from IP: " + ipAddress + " with User-Agent: " + userAgent);

        if (utente != null) {
            // Crea un nuovo record di storia del login
            LoginHistory newLogin = new LoginHistory();
            newLogin.setUtente(utente);
            newLogin.setSessionId(sessionId);
            newLogin.setIpAddress(ipAddress);
            newLogin.setUserAgent(userAgent);
            newLogin.setLoginTime(new Date());

            // Salva il nuovo record nel database
            loginHistoryRepository.save(newLogin);
        }
    }

    public void updateLogoutTime(String sessionId) {
        LoginHistory loginHistory = loginHistoryRepository.findBySessionId(sessionId).orElse(null);

        System.out.println("Updating logout time for session: " + sessionId);
        if (loginHistory != null) {
            // Aggiorna il record di login con il tempo di logout
            System.out.println("Found login history record, updating logout time.");
            loginHistory.setLogoutTime(new Date());
            System.out.println("Logout time set to: " + loginHistory.getLogoutTime());
            loginHistoryRepository.save(loginHistory);
        }
    }
}
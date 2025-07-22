package me.leoo.springboot.libri.utente;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UtenteService implements UserDetailsService {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;

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
        utente.addRuolo("ROLE_USER");

        return utenteRepository.save(utente);
    }

    public void delete(String identifier) {
        // Modificato per permettere la cancellazione tramite username o email
        Utente utente = utenteRepository.findByUsername(identifier)
                .or(() -> utenteRepository.findByEmail(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + identifier));

        utenteRepository.delete(utente);
    }
}
package me.leoo.springboot.libri.utente;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtenteService implements UserDetailsService {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utente utente = utenteRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + username));

        return User
                .withUsername(username)
                .password(utente.getPassword())
                .authorities(utente.getRuoli()
                        .stream().map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()))
                .build();
    }

    public Utente register(Utente utente) throws IllegalArgumentException {
        if (utenteRepository.existsByUsername(utente.getUsername())) {
            throw new IllegalArgumentException("Username già in uso: " + utente.getUsername());
        }

        if (utenteRepository.existsByEmail(utente.getEmail())) {
            throw new IllegalArgumentException("Email già in uso: " + utente.getEmail());
        }

        // Encode password
        utente.setPassword(passwordEncoder.encode(utente.getPassword()));

        // Add ROLE_USER
        utente.addRuolo("ROLE_USER");

        return utenteRepository.save(utente);
    }

    public void delete(String username) {
        Utente utente = utenteRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + username));

        utenteRepository.delete(utente);
    }
}

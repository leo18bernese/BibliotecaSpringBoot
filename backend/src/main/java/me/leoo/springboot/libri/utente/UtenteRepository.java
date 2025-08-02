package me.leoo.springboot.libri.utente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtenteRepository extends JpaRepository<Utente, Long> {

    Optional<Utente> findByUsername(String username);

    Optional<Utente> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}

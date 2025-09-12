package me.leoo.springboot.libri.utente;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.Optional;

public interface UtenteRepository extends JpaRepository<Utente, Long> {

    @Override
    @NonNull
    Page<Utente> findAll(@NonNull Pageable pageable);

    Optional<Utente> findByUsername(String username);

    Optional<Utente> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}

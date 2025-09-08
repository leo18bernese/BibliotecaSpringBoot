package me.leoo.springboot.libri.buono;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BuonoRepository extends JpaRepository<Buono, Long> {

    Optional<Buono> findByUtente(Utente utente);

    Optional<Buono> findByCodice(String codice);

    Optional<Buono> findByCodiceAndUtente(String codice, Utente utente);
}

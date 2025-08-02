package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdineRepository extends JpaRepository<Ordine, Long> {

    Optional<Ordine> findByIdAndUtente(long id, Utente utente);

    boolean existsByIdAndUtente(long id, Utente utente);

    List<Ordine> findAllByUtente(Utente utente);
}

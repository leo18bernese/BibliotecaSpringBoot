package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarrelloRepository extends JpaRepository<Carrello, Long> {

    Optional<Carrello> findByUtente(Utente utente);

}

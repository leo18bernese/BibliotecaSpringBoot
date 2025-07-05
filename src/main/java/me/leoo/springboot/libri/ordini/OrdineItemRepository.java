package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdineItemRepository extends JpaRepository<OrdineItem, Long> {

}

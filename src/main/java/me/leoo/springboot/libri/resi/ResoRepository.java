package me.leoo.springboot.libri.resi;

import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ResoRepository extends JpaRepository<Reso, Long> {

    Set<Reso> getAllByOrdineUtenteId(Long utenteId);

    Optional<Reso> findByIdAndOrdineUtenteId(Long id, Long utenteId);

    boolean existsByIdAndOrdineUtenteId(Long id, Long utenteId);
}
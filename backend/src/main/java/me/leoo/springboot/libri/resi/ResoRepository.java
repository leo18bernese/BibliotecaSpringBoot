package me.leoo.springboot.libri.resi;

import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ResoRepository extends JpaRepository<Reso, Long> {

    Set<Reso> getAllByOrdineUtenteId(Long utenteId);

    Optional<Reso> findByIdAndOrdineUtenteId(Long id, Long utenteId);

    List<Messaggio> findAllByOrdineUtenteId(Long utenteId);

    @Query("SELECT m FROM Reso r JOIN r.messaggi m WHERE m.id = :id")
    Optional<Messaggio> findMessaggioById(Long id);

    boolean existsByIdAndOrdineUtenteId(Long id, Long utenteId);
}
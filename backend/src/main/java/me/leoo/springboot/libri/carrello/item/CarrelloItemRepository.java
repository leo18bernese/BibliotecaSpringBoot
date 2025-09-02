package me.leoo.springboot.libri.carrello.item;

import me.leoo.springboot.libri.carrello.common.PrenotazioneUtenteInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrelloItemRepository extends JpaRepository<CarrelloItem, Long> {

    @Query("SELECT new me.leoo.springboot.libri.carrello.common.PrenotazioneUtenteInfo(ci.carrello.utente.id, SUM(ci.quantita)) " +
            "FROM CarrelloItem ci WHERE ci.variante.libro.id = :libroId GROUP BY ci.carrello.utente.id")
    Page<PrenotazioneUtenteInfo> findPrenotazioniByLibroId(Long libroId, Pageable pageable);

    // Per il totale delle quantità prenotate (utile per dashboard)
    @Query("SELECT COALESCE(SUM(ci.quantita), 0) FROM CarrelloItem ci WHERE ci.variante.libro.id = :libroId")
    Long getTotalePrenotatoByLibroId(Long libroId);
}
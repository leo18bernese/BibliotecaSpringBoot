package me.leoo.springboot.libri.libri;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Set;

public interface LibroRepository extends JpaRepository<Libro, Long>, JpaSpecificationExecutor<Libro> {

    // Query sui metadati del libro (non cambiano)
    List<Libro> findByTitoloEqualsIgnoreCase(String keyword);

    List<Libro> findByTitoloIsContainingIgnoreCase(String keyword);

    List<Libro> findByAutoreNome(String autore);

    List<Libro> findByAutoreNomeContaining(String autore);

    List<Libro> findByGenere(String genere);

    @Query("SELECT l FROM Libro l WHERE " +
            "(:titolo IS NULL OR l.titolo = :titolo) AND " +
            "(:genere IS NULL OR l.genere = :genere) AND " +
            "(:autore IS NULL OR l.autore.nome = :autore)")
    Iterable<Libro> advanceSearch(@Param("titolo") String titolo,
                                  @Param("genere") String genere,
                                  @Param("autore") String autore);

    @Override
    @NonNull
    Page<Libro> findAll(@NonNull Pageable pageable);

    // Query aggiornate per le varianti
    @Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE v.rifornimento.quantita > 0 AND l.id NOT IN (:excludeIds) AND l.hidden = false ORDER BY FUNCTION('RAND')")
    List<Libro> findRandomAvailableBooksExcluding(Pageable pageable, @Param("excludeIds") Set<Long> excludeIds);

    // Libri più recenti (non cambia)
    @Query("SELECT l FROM Libro l WHERE l.hidden = false ORDER BY l.dataAggiunta DESC")
    List<Libro> findTop10ByOrderByDataAggiuntaDesc();

    // Libri in offerta - ora basato sulle varianti
    @Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE v.prezzo.sconto IS NOT NULL AND l.hidden = false")
    List<Libro> findByInOffertaTrue();

    // Libri con scorte basse - ora basato sulle varianti
    @Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE   l.hidden = false AND v.rifornimento.quantita BETWEEN :min AND :max ORDER BY v.rifornimento.quantita ASC")
    List<Libro> findTop5ByVariantiRifornimentoQuantitaBetween(@Param("min") int min, @Param("max") int max);

    // Nuove query utili per le varianti

    // Trova libri con almeno una variante disponibile
    @Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE v.rifornimento.quantita > 0")
    List<Libro> findLibriConVariantiDisponibili();

    // Trova libri con tutte le varianti esaurite
    @Query("SELECT l FROM Libro l WHERE NOT EXISTS (SELECT v FROM Variante v WHERE v.libro = l AND v.rifornimento.quantita > 0)")
    List<Libro> findLibriEsauriti();

    //exists variante by id
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Variante v WHERE v.id = :varianteId")
    boolean existsVarianteById(@Param("varianteId") Long varianteId);


    // Statistiche utili

    // Conta quante varianti ha un libro
    @Query("SELECT COUNT(v) FROM Variante v WHERE v.libro.id = :libroId")
    long countVariantiByLibroId(@Param("libroId") Long libroId);

    // Trova libri simili per genere con almeno una variante disponibile
    @Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE l.genere = :genere AND l.id != :excludeId AND v.rifornimento.quantita > 0")
    List<Libro> findSimilarAvailableBooks(@Param("genere") String genere, @Param("excludeId") Long excludeId, Pageable pageable);

    // Bestseller basati su vendite (assumendo che tu abbia un sistema di tracking vendite)
    /*@Query("SELECT DISTINCT l FROM Libro l JOIN l.varianti v WHERE v.rifornimento.venduti > :minVenduti ORDER BY v.rifornimento.venduti DESC")
    List<Libro> findBestsellers(@Param("minVenduti") int minVenduti, Pageable pageable);*/
}
package me.leoo.springboot.libri.libri;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    List<Libro> findByTitoloEqualsIgnoreCase(String keyword);

    List<Libro> findByTitoloIsContainingIgnoreCase(String keyword);

    List<Libro> findByAutore(String autore);

    List<Libro> findByAutoreContaining(String autore);

    List<Libro> findByGenere(String genere);

    @Query("SELECT l FROM Libro l WHERE " +
            "(:titolo IS NULL OR l.titolo = :titolo) AND " +
            "(:genere IS NULL OR l.genere = :genere) AND " +
            "(:autore IS NULL OR l.autore = :autore)")
    public Iterable<Libro> advanceSearch(@Param("titolo") String titolo,
                                         @Param("genere") String genere,
                                         @Param("autore") String autore);
}

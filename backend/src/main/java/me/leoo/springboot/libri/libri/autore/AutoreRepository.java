package me.leoo.springboot.libri.libri.autore;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutoreRepository extends JpaRepository<Autore, Long> {
    Optional<Autore> findByNome(String nome);

    List<Autore> findByNomeContainingIgnoreCase(String nome);
}

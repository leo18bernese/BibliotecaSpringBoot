package me.leoo.springboot.libri.recensioni;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;

public interface RecensioneRepository extends JpaRepository<Recensione, Long> {

    Set<Recensione> findByLibroId(Long libroId);
}

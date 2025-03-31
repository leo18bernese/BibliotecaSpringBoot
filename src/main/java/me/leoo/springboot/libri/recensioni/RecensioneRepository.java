package me.leoo.springboot.libri.recensioni;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RecensioneRepository extends JpaRepository<Recensione, Long> {

    Iterable<Recensione> findByLibroId(Long libroId);
}

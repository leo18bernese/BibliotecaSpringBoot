package me.leoo.springboot.libri.rifornimento;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RifornimentoRepository extends JpaRepository<Rifornimento, Long> {

}

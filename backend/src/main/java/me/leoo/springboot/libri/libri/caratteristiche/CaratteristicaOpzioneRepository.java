package me.leoo.springboot.libri.libri.caratteristiche;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaratteristicaOpzioneRepository extends JpaRepository<CaratteristicaOpzione, Long> {
}
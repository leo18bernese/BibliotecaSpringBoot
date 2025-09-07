package me.leoo.springboot.libri.spedizione;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpedizioneIndirizzoRepository extends JpaRepository<SpedizioneIndirizzo, Long> {
}
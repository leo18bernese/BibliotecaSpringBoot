package me.leoo.springboot.libri.utente.security;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {


    List<LoginHistory> findByUtente_Id(Long userId);

    Page<LoginHistory> findByUtente_Id(Long userId, Pageable pageable);

    Optional<LoginHistory> findTopByUtente_UsernameOrderByLoginTimeDesc(String username);

    Optional<LoginHistory> findBySessionId(String sessionId);

}
package me.leoo.springboot.libri.utente.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    /**
     * Finds a list of LoginHistory records by the username of the associated Utente.
     *
     * @param userId The ID of the Utente.
     * @return A list of LoginHistory records.
     */
    List<LoginHistory> findByUtente_Id(Long userId);

    /**
     * Finds the latest LoginHistory record for a given user.
     *
     * @param username The username of the Utente.
     * @return The latest LoginHistory record, or empty if not found.
     */
    Optional<LoginHistory> findTopByUtente_UsernameOrderByLoginTimeDesc(String username);

    Optional<LoginHistory> findBySessionId(String sessionId);

}
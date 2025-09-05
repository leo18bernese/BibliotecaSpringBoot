package me.leoo.springboot.libri.utente.security;

import jakarta.persistence.*;
import lombok.Data;
import me.leoo.springboot.libri.utente.Utente;

import java.util.Date;

@Entity
@Table(name = "login_history")
@Data
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Utente utente;

    private String sessionId;
    private String ipAddress;
    private String userAgent;

    @Temporal(TemporalType.TIMESTAMP)
    private Date loginTime;

    @Temporal(TemporalType.TIMESTAMP)
    private Date logoutTime;

}
package me.leoo.springboot.libri.resi.chat;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.resi.Reso;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reso_chat_messaggi")
public class Messaggio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reso_id", nullable = false)
    @JsonIgnore
    private Reso reso;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String testo;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "reso_chat_allegati", joinColumns = @JoinColumn(name = "messaggio_id"))
    @Column(name = "allegato_path")
    private Set<String> allegati = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMittente mittente;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
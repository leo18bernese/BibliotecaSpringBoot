package me.leoo.springboot.libri.resi.stato;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.resi.Reso;

import java.util.Date;

@Entity
@Table(name = "reso_stati_storico")
@Getter
@Setter
@NoArgsConstructor
public class StatoResoStorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reso_id", nullable = false)
    @JsonIgnore
    private Reso reso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoReso stato;

    @Column(nullable = false)
    private Date dataAggiornamento = new Date();

    private String messaggio;

    public StatoResoStorico(Reso reso, StatoReso stato, String messaggio) {
        this.reso = reso;
        this.stato = stato;
        this.messaggio = messaggio;
    }
}


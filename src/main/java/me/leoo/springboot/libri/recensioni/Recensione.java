package me.leoo.springboot.libri.recensioni;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Recensione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long libroId;
    private Long utenteId;

    private String titolo;
    private String testo;

    private int stelle;
    private boolean approvato;
    private boolean consigliato;

    private Date dataCreazione;
    private Date dataModifica;

    public Recensione(Long libroId, Long utenteId, String titolo, String testo, int stelle, boolean approvato, boolean consigliato, Date dataCreazione, Date dataModifica) {
        this.libroId = libroId;
        this.utenteId = utenteId;
        this.titolo = titolo;
        this.testo = testo;
        this.stelle = stelle;
        this.approvato = approvato;
        this.consigliato = consigliato;
        this.dataCreazione = dataCreazione;
        this.dataModifica = dataModifica;
    }
}

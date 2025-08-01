package me.leoo.springboot.libri.carrello;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;

import java.util.Date;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CarrelloItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrello_id", nullable = false)
    private Carrello carrello;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "libro_id", nullable = false)
    private Libro libro;

    private int quantita;

    @Temporal(TemporalType.TIMESTAMP)
    private Date aggiunta;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    public CarrelloItem(Carrello carrello, Libro libro, int quantita) {
        this.carrello = carrello;
        this.libro = libro;
        this.quantita = quantita;
        this.aggiunta = new Date();
        this.ultimaModifica = new Date();
    }
}

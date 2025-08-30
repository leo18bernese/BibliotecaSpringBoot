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
    private double prezzoAggiunta;

    @Temporal(TemporalType.TIMESTAMP)
    private Date aggiunta;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    public CarrelloItem(Carrello carrello, Libro libro, int quantita) {
        this.carrello = carrello;
        this.libro = libro;
        this.quantita = quantita;
        this.prezzoAggiunta = libro.getRifornimento().getPrezzoTotale();
        this.aggiunta = new Date();
        this.ultimaModifica = new Date();
    }

    public void fixQuantity(Libro libro) {
        this.quantita = Math.min(this.quantita, libro.getRifornimento().getQuantita());
        this.ultimaModifica = new Date();
    }

    public void confirmNotices(Libro libro) {
        this.prezzoAggiunta = libro.getRifornimento().getPrezzoTotale();
        this.ultimaModifica = new Date();
    }
}

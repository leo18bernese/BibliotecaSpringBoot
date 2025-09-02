package me.leoo.springboot.libri.carrello.item;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.variante.Variante;

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
    @JoinColumn(name = "variante_id", nullable = false)
    private Variante variante;

    private int quantita;
    private double prezzoAggiunta;

    @Temporal(TemporalType.TIMESTAMP)
    private Date aggiunta;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    public CarrelloItem(Carrello carrello, Variante variante, int quantita) {
        this.carrello = carrello;
        this.variante = variante;
        this.quantita = quantita;
        this.prezzoAggiunta = variante.getPrezzo().getPrezzoTotale();
        this.aggiunta = new Date();
        this.ultimaModifica = new Date();
    }

    public void fixQuantity() {
        this.quantita = Math.min(this.quantita, variante.getRifornimento().getQuantita());
        this.ultimaModifica = new Date();
    }

    public void confirmNotices() {
        this.prezzoAggiunta = variante.getPrezzo().getPrezzoTotale();
        this.ultimaModifica = new Date();
    }

    public Libro getLibro() {
        return variante.getLibro();
    }
}

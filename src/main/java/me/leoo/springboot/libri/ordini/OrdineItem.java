package me.leoo.springboot.libri.ordini;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.utils.Sconto;

import java.util.Date;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class OrdineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordine_id")
    @JsonIgnore
    private Ordine ordine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "libro_id", nullable = false)
    private Libro libro;

    private String titolo;
    private int quantita;
    private double prezzo;

    private Sconto sconto;

    public OrdineItem(Libro libro, int quantita) {
        this.libro = libro;
        this.titolo = libro.getTitolo();
        this.quantita = quantita;
        this.prezzo = libro.getRifornimento().getPrezzoTotale();
        this.sconto = libro.getRifornimento().getSconto();
    }
}

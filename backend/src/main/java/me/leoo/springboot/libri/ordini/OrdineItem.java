package me.leoo.springboot.libri.ordini;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.variante.Variante;
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

    private Long libroId;
    private Long varianteId;
    private String varianteNome;

    private String titolo;
    private int quantita;
    private double prezzo;
    private Date dataAggiunta;

    private Sconto sconto;

    public OrdineItem(Variante variante, int quantita, Date dataAggiunta) {
        this.libroId = variante.getLibro().getId();
        this.varianteId = variante.getId();
        this.varianteNome = variante.getNome();
        this.titolo = variante.getLibro().getTitolo();
        this.quantita = quantita;
        this.prezzo = variante.getPrezzo().getPrezzoTotale();
        this.sconto = variante.getPrezzo().getSconto();
        this.dataAggiunta = dataAggiunta;
    }


}

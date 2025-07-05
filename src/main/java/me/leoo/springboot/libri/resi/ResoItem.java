package me.leoo.springboot.libri.resi;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.OrdineItem;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class ResoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reso_id")
    @JsonIgnore
    private Reso reso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordine_item_id", nullable = false)
    private OrdineItem ordineItem;

    private MotivoReso motivo;
    private String descrizione;

    private int quantita;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "reso_item_prove_foto", joinColumns = @JoinColumn(name = "reso_item_id"))
    @Column(name = "foto_path")
    private Set<String> proveFoto;

    public ResoItem(OrdineItem ordineItem, MotivoReso motivo, String descrizione, int quantita) {
        this.ordineItem = ordineItem;
        this.motivo = motivo;
        this.descrizione = descrizione;
        this.quantita = quantita;

        this.proveFoto = new HashSet<>();
    }

}

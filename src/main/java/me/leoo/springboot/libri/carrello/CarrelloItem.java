package me.leoo.springboot.libri.carrello;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class CarrelloItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Carrello carrello;

    @ManyToOne
    private Libro libro;

    private int quantita;

    public CarrelloItem(Carrello carrello, Libro libro, int quantita) {
        this.carrello = carrello;
        this.libro = libro;
        this.quantita = quantita;
    }
}

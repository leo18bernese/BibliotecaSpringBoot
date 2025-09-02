package me.leoo.springboot.libri.libri.variante;

import jakarta.persistence.*;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.descrizione.LibroDimension;
import me.leoo.springboot.libri.libri.prezzo.Prezzo;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.Map;


@Entity
public class LibroVariante {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private Libro libroBase;

    private String nome;

    @OneToOne(cascade = CascadeType.PERSIST)
    private Prezzo prezzo;

    @OneToOne(cascade = CascadeType.PERSIST)
    private Rifornimento rifornimento;

    private LibroDimension dimensioni;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> recensioni = List.of(); // Recensioni specifiche per questa variante

    @ElementCollection
    private Map<String, String> attributiSpecifici;
}
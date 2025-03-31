package me.leoo.springboot.libri.libri;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.rifornimento.Rifornimento;

import java.util.List;

@Slf4j
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String titolo;
    private String autore;
    private String genere;
    private int annoPubblicazione;
    private int numeroPagine;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> recensioni = List.of();

    @OneToOne(cascade = CascadeType.PERSIST)
    private Rifornimento rifornimento;

    public Libro(String titolo, String autore, String genere, int annoPubblicazione, int numeroPagine, int quantita, double prezzo) {
        this.titolo = titolo;
        this.autore = autore;
        this.genere = genere;
        this.annoPubblicazione = annoPubblicazione;
        this.numeroPagine = numeroPagine;

        this.rifornimento = new Rifornimento(quantita, prezzo);

    }


    public Libro updateFrom(Libro libro) {
        this.titolo = libro.getTitolo();
        this.autore = libro.getAutore();
        this.genere = libro.getGenere();
        this.annoPubblicazione = libro.getAnnoPubblicazione();
        this.numeroPagine = libro.getNumeroPagine();
        return this;
    }
}

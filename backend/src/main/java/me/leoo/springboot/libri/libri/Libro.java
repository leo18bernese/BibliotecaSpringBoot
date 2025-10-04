package me.leoo.springboot.libri.libri;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.descrizione.LibroDimension;
import me.leoo.springboot.libri.libri.descrizione.LibroInfo;
import me.leoo.springboot.libri.libri.prezzo.Prezzo;
import me.leoo.springboot.libri.libri.variante.Variante;
import me.leoo.springboot.libri.rifornimento.Rifornimento;

import java.util.*;

@Slf4j
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    private Category category;

    private String titolo;

    @ManyToOne(optional = false)
    private Autore autore;

    private String genere;
    private int annoPubblicazione;
    private int numeroPagine;
    private String editore;
    private String lingua;
    private String isbn;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tags = List.of();

    private Date dataAggiunta = new Date();

    @OneToOne(mappedBy = "libro", cascade = CascadeType.ALL, orphanRemoval = true)
    private LibroInfo descrizione;

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Variante> varianti = new ArrayList<>();

    private boolean hidden = false;

    // Costruttore con variante predefinita per compatibilità
    public Libro(Category category, String titolo, Autore autore, String genere, int annoPubblicazione, int numeroPagine,
                 String editore, String lingua, String isbn, int quantita, double prezzo) {
        this.category = category;
        this.titolo = titolo;
        this.autore = autore;
        this.genere = genere;
        this.annoPubblicazione = annoPubblicazione;
        this.numeroPagine = numeroPagine;
        this.editore = editore;
        this.lingua = lingua;
        this.isbn = isbn;

        this.descrizione = new LibroInfo(this, """
                Un libro scritto per raccontare una storia, condividere conoscenza o semplicemente per intrattenere.
                <br><br>
                
                Lo scopo di un libro è quello di trasmettere idee, emozioni e informazioni attraverso le parole scritte.
                Quindi, un libro può essere un romanzo, un saggio, una biografia o qualsiasi altra forma di narrazione scritta.
                """);

        // Genera dimensioni casuali per la variante base
        double length = new Random().nextInt(10, 20);
        double width = length + new Random().nextInt(5, 10);
        double height = new Random().nextInt(1, 5);
        LibroDimension dimension = new LibroDimension(length, width, height, 0.5);

        // Crea variante base (nome vuoto indica variante standard)

        // aggiungiVariante("", quantita, prezzo, dimension, Map.of());

        aggiungiVariante("rosso flex", quantita, prezzo, dimension, Map.of("colore", "rosso", "materiale", "flex"));
        aggiungiVariante("rosso rigido", quantita, prezzo + 5, dimension, Map.of("colore", "rosso", "materiale", "rigido"));
        aggiungiVariante("blu flex", quantita, prezzo, dimension, Map.of("colore", "blu", "materiale", "flex"));

    }

    public Variante aggiungiVariante(String nomeVariante, int quantita, double prezzo, LibroDimension dimension, Map<String, String> attributiSpecifici) {
        Variante variante = new Variante(this, nomeVariante, new Prezzo(prezzo), new Rifornimento(quantita), dimension);

        if (attributiSpecifici != null) {
            variante.addAttributi(attributiSpecifici);
        }

        this.varianti.add(variante);
        return variante;
    }

    public Libro updateFrom(LibroController.UpdateLibroRequest request) {
        this.titolo = request.titolo();
        this.genere = request.genere();
        this.annoPubblicazione = request.annoPubblicazione();
        this.numeroPagine = request.numeroPagine();
        this.editore = request.editore();
        this.lingua = request.lingua();
        this.isbn = request.isbn();

        if (this.descrizione == null) {
            this.descrizione = new LibroInfo(this, request.descrizione());
        } else {
            this.descrizione.setDescrizione(request.descrizione());
        }

        this.descrizione.clearCaratteristiche();

        if (request.caratteristiche() != null) {
            for (var entry : request.caratteristiche().entrySet()) {
                this.descrizione.addCaratteristica(entry.getKey(), entry.getValue());
            }
        }

        return this;
    }

    public LibroController.LiteBookResponse toLiteBookResponse() {
        // Usa la variante più economica per la risposta lite da usare in home page
        Variante variante = getLowestVariant();

        if (variante == null) return null;

        return new LibroController.LiteBookResponse(
                this.id,
                this.titolo,
                this.autore != null ? this.autore.getNome() : null,
                this.editore,
                this.annoPubblicazione,
                variante.getPrezzo().getPrezzo(),
                variante.getPrezzo().getPrezzoTotale(),
                variante.getPrezzo().getSconto()
        );
    }

    // Metodi utili per lavorare con le varianti
    @JsonIgnore
    public boolean isInStock() {
        return varianti.stream().anyMatch(v -> v.getRifornimento().getQuantita() > 0);
    }

    @JsonIgnore
    public boolean isInOfferta() {
        return varianti.stream().anyMatch(v -> v.getPrezzo().getSconto() != null);
    }

    @JsonIgnore
    public double getLowestPrice() {
        return varianti.stream()
                .mapToDouble(v -> v.getPrezzo().getPrezzoTotale())
                .min()
                .orElse(0.0);
    }

    public Variante getLowestVariant() {
        return varianti.stream()
                .sorted(Comparator.comparing(v -> v.getPrezzo().getPrezzoTotale()))
                .filter(v -> !v.getRifornimento().isEsaurito())
                .findFirst()
                .orElse(varianti.get(0));
    }


    @JsonIgnore
    public Variante getVarianteStandard() {
        return varianti.stream()
                .filter(v -> v.getNome().isEmpty())
                .findFirst()
                .orElse(varianti.isEmpty() ? null : varianti.get(0));
    }

    public Optional<Variante> getVariante(Long id) {
        return varianti.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst();
    }

    public Optional<Variante> getVariante(String nome) {
        return varianti.stream()
                .filter(v -> v.getNome().equalsIgnoreCase(nome))
                .findFirst();
    }

    public List<Long> getTutteLeRecensioni() {
        return varianti.stream()
                .flatMap(v -> v.getRecensioni().stream())
                .toList();
    }

    // Category map
    public Map<Long, String> getCategoryMap() {
        List<Category> categories = new ArrayList<>();

        Category c = this.getCategory();

        while (c != null) {
            categories.add(c);
            c = c.getParent();
        }

        Collections.reverse(categories);

        Map<Long, String> map = new LinkedHashMap<>();
        categories.forEach(cat -> map.put(cat.getId(), cat.getName()));

        return map;
    }

}
package me.leoo.springboot.libri.carrello;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.utente.Utente;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Carrello {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", unique = true, nullable = false)
    private Utente utente;

    @OneToMany(mappedBy = "carrello", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CarrelloItem> items = new HashSet<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCreazione;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    public Carrello(Utente utente) {
        this.utente = utente;
        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();
    }

    public void addItem(Libro libro, int quantita) {

        Rifornimento rifornimento = libro.getRifornimento();

        if (!rifornimento.isDisponibile(quantita)) {
            throw new IllegalArgumentException("Quantita insuficiente");
        }

        CarrelloItem item = getItem(libro);
        if (item == null) {
            System.out.println("item is null, creating new item");
            items.add(new CarrelloItem(this, libro, quantita));
        } else {
            System.out.println("item is not null, updating existing item");
            item.setQuantita(item.getQuantita() + quantita);
        }

        System.out.println("Adding " + quantita + " of " + libro.getTitolo() + " to the cart");

        rifornimento.addPrenotati(quantita);
        System.out.println(libro + "    " + item + "    " + rifornimento + "    " + rifornimento.getPrenotati());

        System.out.println("Updated rifornimento: " + rifornimento.getPrenotati() + " prenotati");
        ultimaModifica = new Date();

    }

    public void removeItem(Libro libro, int quantita) {
        Rifornimento rifornimento = libro.getRifornimento();

        CarrelloItem item = getItem(libro);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        if (item.getQuantita() <= quantita) {
            items.remove(item);

            rifornimento.removePrenotati(item.getQuantita());
        } else {
            item.setQuantita(item.getQuantita() - quantita);

            rifornimento.removePrenotati(quantita);
        }

        ultimaModifica = new Date();
    }

    public CarrelloItem getItem(Libro libro) throws IllegalArgumentException {
        return items.stream()
                .filter(c -> c.getLibro().getId().equals(libro.getId()))
                .findFirst()
                .orElse(null);
    }

    public boolean containsKey(Libro libro) {
        return items.stream().anyMatch(c -> c.getLibro().getId().equals(libro.getId()));
    }


    public double getPrezzo(Libro libro) {
        CarrelloItem item = getItem(libro);

        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getQuantita() * libro.getRifornimento().getPrezzoTotale();
    }

    public double getTotale() {
        return items.stream()
                .map(i -> i.getQuantita() * i.getLibro().getRifornimento().getPrezzoTotale())
                .reduce(0.0, Double::sum);

    }

    public String getDisponibilita(Libro libro) {
        CarrelloItem item = getItem(libro);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getLibro().getRifornimento().getStatus();
    }

    public double getSconto(Libro libro) {
        CarrelloItem item = getItem(libro);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getLibro().getRifornimento().getSconto();
    }

    public void svuota() {
        items.clear();
        ultimaModifica = new Date();
    }

}

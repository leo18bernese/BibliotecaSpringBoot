package me.leoo.springboot.libri.carrello;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.utente.Utente;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Carrello {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Utente utente;

    @OneToMany
    private Map<Long, CarrelloItem> items = new HashMap<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCreazione;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    public Carrello(Utente utente) {
        this.utente = utente;
        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();
    }

    public void addItem(Libro libro, int quantita) throws Exception {
        Rifornimento rifornimento = libro.getRifornimento();

        if (!rifornimento.isDisponibile(quantita)) {
            throw new IllegalArgumentException("Quantita insuficiente");
        }

        if (items.containsKey(libro.getId())) {
            CarrelloItem item = items.get(libro.getId());
            item.setQuantita(item.getQuantita() + quantita);
        } else {
            items.put(libro.getId(), new CarrelloItem(this, libro, quantita));
        }

        rifornimento.addPrenotati(quantita);
        ultimaModifica = new Date();
    }

    public void removeItem(Libro libro, int quantita) throws Exception {
        Rifornimento rifornimento = libro.getRifornimento();

        if (!items.containsKey(libro.getId())) {
            throw new IllegalArgumentException("Libro non presente nel carrello");
        }

        CarrelloItem item = items.get(libro.getId());

        if (item.getQuantita() <= quantita) {
            items.remove(libro.getId());

            rifornimento.removePrenotati(item.getQuantita());
        } else {
            item.setQuantita(item.getQuantita() - quantita);

            rifornimento.removePrenotati(quantita);

        }

        ultimaModifica = new Date();
    }

    public CarrelloItem getItem(Libro libro) throws Exception {
        if (!items.containsKey(libro.getId())) {
            throw new IllegalArgumentException("Libro non presente nel carrello");
        }

        return items.get(libro.getId());
    }


    public double getPrezzo(Libro libro) throws Exception {
        if (!items.containsKey(libro.getId())) {
            throw new IllegalArgumentException("Libro non presente nel carrello");
        }

        CarrelloItem item = items.get(libro.getId());

        return item.getQuantita() * libro.getRifornimento().getPrezzoTotale();
    }

    public double getTotale() {
        double totale = 0;

        for (CarrelloItem item : items.values()) {
            totale += item.getQuantita() * item.getLibro().getRifornimento().getPrezzoTotale();
        }

        return totale;
    }

    public String getDisponibilita(Libro libro) throws Exception {
        if (!items.containsKey(libro.getId())) {
            throw new IllegalArgumentException("Libro non presente nel carrello");
        }

        CarrelloItem item = items.get(libro.getId());

        return item.getLibro().getRifornimento().getStatus();
    }

    public double getSconto(Libro libro) throws Exception {
        if (!items.containsKey(libro.getId())) {
            throw new IllegalArgumentException("Libro non presente nel carrello");
        }

        CarrelloItem item = items.get(libro.getId());

        return item.getLibro().getRifornimento().getSconto();
    }

    public void svuota() {
        items.clear();
        ultimaModifica = new Date();
    }

}

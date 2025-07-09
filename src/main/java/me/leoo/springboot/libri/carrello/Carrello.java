package me.leoo.springboot.libri.carrello;

import jakarta.persistence.*;
import jakarta.transaction.NotSupportedException;
import lombok.*;
import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utils.LibriUtils;
import me.leoo.springboot.libri.utils.Sconto;

import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "carrello_buono",
            joinColumns = @JoinColumn(name = "carrello_id"),
            inverseJoinColumns = @JoinColumn(name = "buono_id"))
    private Set<Buono> couponCodes = new HashSet<>();

    public Carrello(Utente utente) {
        this.utente = utente;
        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();
    }

    public void checkCoupons() {
        for (Buono coupon : couponCodes) {

            try {
                coupon.validate(utente, this);
            } catch (Exception ignored) {
                System.out.println("Coupon " + coupon.getCodice() + " non valido, rimuovendo dal carrello.");
                couponCodes.remove(coupon);
            }
        }

        System.out.println("after checkCoupons: " + couponCodes.size() + " coupon(s) validi nel carrello.");
    }

    public void addItem(Libro libro, int quantita) {

        Rifornimento rifornimento = libro.getRifornimento();

        if (!rifornimento.isDisponibile(quantita)) {
            throw new IllegalArgumentException("Quantità richiesta non disponibile");
        }

        CarrelloItem item = getItem(libro);
        if (item == null) {
            System.out.println("item is null, creating new item");
            items.add(new CarrelloItem(this, libro, quantita));
        } else {
            System.out.println("item is not null, updating existing item");
            item.setQuantita(item.getQuantita() + quantita);
            item.setUltimaModifica(new Date());
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
            item.setUltimaModifica(new Date());

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

    public double getSommaPrezzi() {
        return items.stream()
                .mapToDouble(i -> i.getQuantita() * i.getLibro().getRifornimento().getPrezzoTotale())
                .sum();
    }

    public void sortCoupons() {
        couponCodes = couponCodes.stream()
                .sorted((b1, b2) -> {
                    boolean v1 = b1.getSconto().getValore() > 0;
                    boolean v2 = b2.getSconto().getValore() > 0;
                    return Boolean.compare(!v1, !v2);
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public double getPrezzoFinale() throws NotSupportedException {
        double value = getSommaPrezzi();

        System.out.println("Coupon codes before sorting: " + couponCodes.stream().map(Buono::getCodice).collect(Collectors.joining(", ")));
        sortCoupons();

        System.out.println("Coupon codes sorted " + couponCodes.stream().map(Buono::getCodice).collect(Collectors.joining(", ")));

        for (Buono coupon : couponCodes) {
            if (coupon.getSconto() != null) {
                value -= coupon.getSconto().getSconto(value);
            }
        }

        if (value < 0) {
            throw new NotSupportedException("Funzione non supportata: il totale non può essere negativo");
        }

        return LibriUtils.round(value);
    }

    public String getDisponibilita(Libro libro) {
        CarrelloItem item = getItem(libro);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getLibro().getRifornimento().getStatus();
    }

    public Sconto getSconto(Libro libro) {
        CarrelloItem item = getItem(libro);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getLibro().getRifornimento().getSconto();
    }

    public boolean canCheckout() {
        return !items.isEmpty() && items.stream().allMatch(i -> i.getLibro().getRifornimento().isDisponibile(i.getQuantita()));
    }

    public void clear() {
        items.clear();
        couponCodes.clear();
        dataCreazione = new Date();
        ultimaModifica = new Date();
    }

}

package me.leoo.springboot.libri.carrello;

import jakarta.persistence.*;
import jakarta.transaction.NotSupportedException;
import lombok.*;
import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.carrello.item.CarrelloItem;
import me.leoo.springboot.libri.libri.miscellaneous.DeliveryPackage;
import me.leoo.springboot.libri.libri.variante.Variante;
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
    private final Set<CarrelloItem> items = new HashSet<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCreazione;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ultimaModifica;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "carrello_buono",
            joinColumns = @JoinColumn(name = "carrello_id"),
            inverseJoinColumns = @JoinColumn(name = "buono_id"))
    private Set<Buono> couponCodes;

    public Carrello(Utente utente) {
        this.utente = utente;
        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();

        this.couponCodes = new LinkedHashSet<>();

    }

    public void checkCoupons() {
        for (Buono coupon : couponCodes) {

            try {
                coupon.validate(utente, this);
            } catch (Exception ignored) {
                couponCodes.remove(coupon);
            }
        }
    }

    public void addItem(Variante variante, int quantita) {

        Rifornimento rifornimento = variante.getRifornimento();

        CarrelloItem item = getItem(variante);
        int existingQuantity = item != null ? item.getQuantita() : 0;
        int available = rifornimento.getQuantita() - existingQuantity;

        if (available <= 0) {
            throw new IllegalArgumentException("Quantità richiesta non disponibile");
        }

        if (available < quantita) {
            quantita = available;
        }

        if (item == null) {
            items.add(new CarrelloItem(this, variante, quantita));
        } else {
            item.setQuantita(item.getQuantita() + quantita);
            item.setPrezzoAggiunta(variante.getPrezzo().getPrezzoTotale());
            item.setUltimaModifica(new Date());
        }

        ultimaModifica = new Date();

    }

    public void removeItem(Variante variante, int quantita) {
        Rifornimento rifornimento = variante.getRifornimento();

        CarrelloItem item = getItem(variante);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        if (item.getQuantita() <= quantita) {
            // rimuovi tutti se quantità carrello <= quantità da rimuovere

            items.remove(item);
        } else {
            // altrimenti rimuovi solo la quantità specificata

            item.setQuantita(item.getQuantita() - quantita);
            item.setUltimaModifica(new Date());
        }

        ultimaModifica = new Date();
    }

    public void setItemQuantity(Variante variante, int quantita) {
        if (quantita < 0) {
            throw new IllegalArgumentException("La quantità non può essere negativa");
        }

        Rifornimento rifornimento = variante.getRifornimento();

        CarrelloItem item = getItem(variante);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        int available = rifornimento.getQuantita();

        if (available < quantita) {
            quantita = available;
        }

        if (available <= 0) {
            throw new IllegalArgumentException("Quantità richiesta non disponibile");
        }

        item.setQuantita(quantita);
        item.setPrezzoAggiunta(variante.getPrezzo().getPrezzoTotale());
        item.setUltimaModifica(new Date());

        ultimaModifica = new Date();
    }

    public CarrelloItem getItem(Variante variante) throws IllegalArgumentException {
        return items.stream()
                .filter(c -> c.getLibro().getId().equals(variante.getId()))
                .findFirst()
                .orElse(null);
    }

    public CarrelloItem getItem(Long varianteId) throws IllegalArgumentException {
        return items.stream()
                .filter(c -> c.getLibro().getId().equals(varianteId))
                .findFirst()
                .orElse(null);
    }

    public boolean containsKey(Variante variante) {
        return items.stream().anyMatch(c -> c.getLibro().getId().equals(variante.getId()));
    }


    public double getPrezzo(Variante variante) {
        CarrelloItem item = getItem(variante);

        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return item.getQuantita() * variante.getPrezzo().getPrezzoTotale();
    }

    public double getSommaPrezzi() {
        return items.stream()
                .mapToDouble(i -> i.getQuantita() * i.getVariante().getPrezzo().getPrezzoTotale())
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

        sortCoupons();

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

    public String getDisponibilita(Variante variante) {
        CarrelloItem item = getItem(variante);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return variante.getRifornimento().getStatus();
    }

    public Sconto getSconto(Variante variante) {
        CarrelloItem item = getItem(variante);
        if (item == null) {
            throw new IllegalArgumentException("Libro non trovato nel carrello");
        }

        return variante.getPrezzo().getSconto();
    }

    public DeliveryPackage getSmallestPackage() {
        if (items.isEmpty()) {
            return null;
        }

        double totalVolume = items.stream()
                .mapToDouble(i -> i.getVariante().getDimensioni().getVolume() * i.getQuantita())
                .sum();

        double totalWeight = items.stream()
                .mapToDouble(i -> i.getVariante().getDimensioni().weight() * i.getQuantita())
                .sum();

        double sideLength = Math.cbrt(totalVolume);

        double totalLength = sideLength * 1.2 + 2; // Adding some margin
        double totalWidth = sideLength * 1.2 + 2; // Adding some
        double totalHeight = sideLength * 1.2 + 2;
        double finalWeight = totalWeight * 1.1; // Adding some margin

        double maxLength = items.stream()
                .mapToDouble(i -> i.getVariante().getDimensioni().length())
                .max()
                .orElse(0);

        double maxWidth = items.stream()
                .mapToDouble(i -> i.getVariante().getDimensioni().width())
                .max()
                .orElse(0);

        double maxHeight = items.stream()
                .mapToDouble(i -> i.getVariante().getDimensioni().height())
                .max()
                .orElse(0);

        double finalLength = Math.max(totalLength, maxLength);
        double finalWidth = Math.max(totalWidth, maxWidth);
        double finalHeight = Math.max(totalHeight, maxHeight);

        DeliveryPackage suitable = DeliveryPackage.getMostSuitable(finalLength, finalWidth, finalHeight, finalWeight);

        return suitable != null ? suitable : DeliveryPackage.EXTRA_LARGE; // Default to SMALL if no suitable package found
    }

    public boolean canCheckout() {
        return !items.isEmpty() && items.stream().allMatch(i -> i.getVariante().getRifornimento().isDisponibile(i.getQuantita()));
    }

    public void clearItems() {
        items.clear();

        ultimaModifica = new Date();
    }

    public Carrello clear() {
        clearItems();

        couponCodes.clear();
        dataCreazione = new Date();
        ultimaModifica = new Date();

        return this;
    }

}

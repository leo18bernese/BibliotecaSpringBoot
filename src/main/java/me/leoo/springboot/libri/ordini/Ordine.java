package me.leoo.springboot.libri.ordini;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloItem;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
import me.leoo.springboot.libri.spedizione.SpedizioneLuogo;
import me.leoo.springboot.libri.utente.Utente;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Ordine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id")
    @JsonIgnore
    private Utente utente;

    private StatoOrdine stato;

    private Date dataCreazione;
    private Date ultimaModifica;

    private double sommaTotale;
    private double speseSpedizione;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "ordine_buono",
            joinColumns = @JoinColumn(name = "ordine_id"),
            inverseJoinColumns = @JoinColumn(name = "buono_id"))
    private Set<Buono> couponCodes = new HashSet<>();

    @OneToMany(mappedBy = "ordine", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrdineItem> items = new HashSet<>();

    //spedizione
    private SpedizioneLuogo luogoSpedizione;
    private String corriereId;
    private String tipoSpedizioneId;

    private SpedizioneIndirizzo indirizzoSpedizione;

    //pagamento
    private String metodoPagamento;
    private String idTransazione;

    //errori
    private String errori;

    public Ordine(Carrello carrello, SpedizioneLuogo luogoSpedizione, String corriereId, String tipoSpedizioneId, SpedizioneIndirizzo indirizzoSpedizione, double speseSpedizione, String metodoPagamento) {
        this.utente = carrello.getUtente();
        this.stato = StatoOrdine.IN_ATTESA;

        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();

        this.sommaTotale = carrello.getSommaPrezzi();
        this.speseSpedizione = speseSpedizione;

        this.luogoSpedizione = luogoSpedizione;
        this.corriereId = corriereId;
        this.tipoSpedizioneId = tipoSpedizioneId;
        this.indirizzoSpedizione = indirizzoSpedizione;

        this.metodoPagamento = metodoPagamento;
        this.idTransazione = null; // Da impostare dopo il pagamento

        this.errori = null;

        // Copia gli articoli dal carrello all'ordine
        for (CarrelloItem item : carrello.getItems()) {
            OrdineItem ordineItem = new OrdineItem(item.getLibro(), item.getQuantita());
            ordineItem.setOrdine(this); // Imposta l'ordine corrente

            items.add(ordineItem);
        }

        // Aggiungi i buoni del carrello all'ordine
        for (Buono buono : carrello.getCouponCodes()) {
            if (buono.validate(utente, carrello)) {
                couponCodes.add(buono);
            }
        }

        // Imposta l'utente dell'ordine
        this.utente = carrello.getUtente();
    }
}

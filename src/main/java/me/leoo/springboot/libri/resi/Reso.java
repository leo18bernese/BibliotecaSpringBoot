package me.leoo.springboot.libri.resi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineItem;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.stato.StatoReso;
import me.leoo.springboot.libri.resi.stato.StatoResoStorico;

import java.util.*;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Reso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordine_id", nullable = false)
    private Ordine ordine;

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ResoItem> items = new HashSet<>();

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataAggiornamento ASC")
    private List<StatoResoStorico> stati = new ArrayList<>();

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<Messaggio> messaggi;

    private Date dataCreazione = new Date();

    public Reso(Ordine ordine){
        this.ordine = ordine;

        this.items = new HashSet<>();
        this.messaggi = new ArrayList<>();
        this.stati = new ArrayList<>();

        addStato(StatoReso.RICHIESTO, "non va bene proprio");
    }

    public void addStato(StatoReso stato, String messaggio) {
        StatoResoStorico nuovoStato = new StatoResoStorico(this, stato, messaggio);
        this.stati.add(nuovoStato);
    }

    // Stato
    public void updateStato(StatoReso nuovoStato) {
        if (nuovoStato == null) {
            throw new IllegalArgumentException("Nuovo stato non può essere null");
        }

        addStato(nuovoStato, "");
    }

    public StatoReso getStato() {
        if (stati.isEmpty()) {
            return StatoReso.IN_ATTESA;
        }

        Optional<StatoReso> ultimoStato = stati.stream()
                .map(StatoResoStorico::getStato)
                .reduce((first, second) -> second);

        return ultimoStato.orElse(StatoReso.IN_ATTESA);
    }

    public String getStatoName() {
        return getStato().getDisplayName();
    }

    public String getStatoDescrizione() {
        return getStato().getDescrizione();
    }

    public boolean isStatoWarning() {
        return getStato() == StatoReso.ANNULLATO_DA_CLIENTE || getStato() == StatoReso.ANNULLATO_DA_SUPPORTO
                || getStato() == StatoReso.RESPINTO ;
    }

    // Aggiunge un messaggio al reso
    public void addMessaggio(Messaggio messaggio) {
        if (messaggio == null) {
            throw new IllegalArgumentException("Messaggio non può essere null");
        }

        messaggio.setReso(this);
        this.messaggi.add(messaggio);
    }

    // Aggiunge un item al reso
    public void addItem(ResoItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Item non può essere null");
        }

        item.setReso(this);
        this.items.add(item);
    }

    public void addItem(OrdineItem ordineItem, MotivoReso motivo, String descrizione, int quantita) {
        if (ordineItem == null || motivo == null || descrizione == null || quantita <= 0) {
            throw new IllegalArgumentException("Parametri non validi per l'aggiunta dell'item");
        }

        ResoItem item = new ResoItem(ordineItem, motivo, descrizione, quantita);
        addItem(item);
    }
}

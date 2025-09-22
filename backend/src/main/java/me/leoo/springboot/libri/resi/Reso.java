package me.leoo.springboot.libri.resi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineItem;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
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
    private Set<ResoItem> items;

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataAggiornamento ASC")
    private List<StatoResoStorico> stati;

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<Messaggio> messaggi;

    private final Date dataCreazione = new Date();

    private MetodoRimborso metodoRimborso;

    public Reso(Ordine ordine, MetodoRimborso metodoRimborso) {
        this.ordine = ordine;

        this.items = new HashSet<>();
        this.messaggi = new ArrayList<>();
        this.stati = new ArrayList<>();
        this.metodoRimborso = metodoRimborso;

        //add default messages
        addMessaggio(new Messaggio(this, "ciao, come posso aiutarti?", TipoMittente.OPERATORE));
        addMessaggio(new Messaggio(this, "ciao, ho ricevuto un prodotto sbagliato", TipoMittente.UTENTE));
        addMessaggio(new Messaggio(this, "mi dispiace per l'errore", TipoMittente.OPERATORE));
        addMessaggio(new Messaggio(this, "puoi dirmi cosa hai ricevuto?", TipoMittente.OPERATORE));
        addMessaggio(new Messaggio(this, "sì, ho ordinato un telefono ma ho ricevuto delle cuffie", TipoMittente.UTENTE));
        addMessaggio(new Messaggio(this, "capito", TipoMittente.OPERATORE));
        addMessaggio(new Messaggio(this, "procederemo subito con una sostituzione", TipoMittente.OPERATORE));
        addMessaggio(new Messaggio(this, "ok, grazie mille", TipoMittente.UTENTE));

        addStato(StatoReso.RICHIESTO, "non va bene proprio");
    }

    public double getTotaleReso() {
        return items.stream()
                .mapToDouble(item -> item.getOrdineItem().getPrezzo() * item.getQuantita())
                .sum();
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

    public StatoResoStorico getUltimoStato() {
        if (stati.isEmpty()) {
            return null;
        }
        return stati.get(stati.size() - 1);
    }

    public StatoReso getStato() {
        if (stati.isEmpty()) {
            return StatoReso.IN_ATTESA;
        }

        return stati.stream()
                .max(Comparator.comparing(StatoResoStorico::getDataAggiornamento))
                .map(StatoResoStorico::getStato)
                .orElse(StatoReso.IN_ATTESA);
    }

    public String getStatoName() {
        return getStato().getDisplayName();
    }

    public String getStatoDescrizione() {
        return getStato().getDescrizione();
    }

    public String getStatoMessaggio() {
        StatoResoStorico ultimoStato = getUltimoStato();

        if (ultimoStato == null) {
            return null;
        }

        if (ultimoStato.getMessaggio() != null) {
            return ultimoStato.getMessaggio();
        }

        return "";
    }

    public boolean isStatoWarning() {
        return getStato() == StatoReso.ANNULLATO_DA_CLIENTE || getStato() == StatoReso.ANNULLATO_DA_SUPPORTO
                || getStato() == StatoReso.RESPINTO;
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
    public ResoItem getById(Long itemId) {
        if (itemId == null) {
            throw new IllegalArgumentException("ID dell'item non può essere null");
        }

        return items.stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElse(null);
    }

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

    public void updateItemQuantity(Long itemId, int newQuantity) {
        ResoItem item = getById(itemId);

        if (item == null) {
            throw new IllegalArgumentException("Item non trovato con ID: " + itemId);
        }

        if (newQuantity <= 0) {
            throw new IllegalArgumentException("La quantità deve essere maggiore di zero");
        }

        if (!this.items.contains(item)) {
            throw new IllegalArgumentException("L'item non appartiene a questo reso");
        }

        item.setQuantita(newQuantity);
    }
}

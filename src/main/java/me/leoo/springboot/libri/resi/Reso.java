package me.leoo.springboot.libri.resi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineItem;
import me.leoo.springboot.libri.resi.chat.Messaggio;

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

    @ElementCollection
    @CollectionTable(name = "reso_stati", joinColumns = @JoinColumn(name = "reso_id"))
    @MapKeyColumn(name = "stato")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "data_aggiornamento")
    private Map<StatoReso, Date> stati = new HashMap<>();

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<Messaggio> messaggi;

    private Date dataCreazione = new Date();

    // Inizializza un nuovo reso associato a un ordine
    // Segue l'aggiunta degli item del reso attraverso altri metodi
    public Reso(Ordine ordine){
        this.ordine = ordine;

        this.items = new HashSet<>();
        this.messaggi = new ArrayList<>();
        this.stati = new HashMap<>();
        // Imposta lo stato iniziale del reso
        this.stati.put(StatoReso.IN_ATTESA, new Date());

    }

    // Stato
    public void updateStato(StatoReso nuovoStato) {
        if (nuovoStato == null) {
            throw new IllegalArgumentException("Nuovo stato non può essere null");
        }

        stati.put(nuovoStato, new Date());
    }

    public StatoReso getStato() {
        if (stati.isEmpty()) {
            return StatoReso.IN_ATTESA;
        }

        Optional<StatoReso> ultimoStato = stati.keySet().stream()
                .reduce((first, second) -> second);

        return ultimoStato.orElse(StatoReso.IN_ATTESA);
    }

    public String getStatoName() {
        return getStato().getDisplayName();
    }

    public String getStatoDescrizione() {
        return getStato().getDescrizione();
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

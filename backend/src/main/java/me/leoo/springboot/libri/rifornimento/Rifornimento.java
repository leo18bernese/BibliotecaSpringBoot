package me.leoo.springboot.libri.rifornimento;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.utils.LibriUtils;
import me.leoo.utils.common.random.RandomUtil;
import me.leoo.utils.common.time.TimeUtil;

import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Rifornimento implements Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantita;

    /*@ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "rifornimento_prenotati", joinColumns = @JoinColumn(name = "rifornimento_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "quantita_prenotata")
    private Map<Long, Integer> prenotatiMap = new HashMap<>();*/

    private int giorniConsegna;

    @Temporal(TemporalType.TIMESTAMP)
    @Nullable
    private Date prossimoRifornimento;

    public Rifornimento(int quantita) {
        this(quantita, 3, TimeUtil.fromNow(3, Calendar.DAY_OF_MONTH).getTime());
    }

    public Rifornimento(int quantita, int giorniConsegna, @Nullable Date prossimoRifornimento) {
        this.quantita = quantita;
        this.giorniConsegna = giorniConsegna;
        this.prossimoRifornimento = RandomUtil.randomInt(0, 2) == 1 ? prossimoRifornimento : null;
    }

    // Storage
    public void addQuantita(int quantita) {
        this.quantita += quantita;
    }

    public void removeQuantita(int quantita) {
        if (this.quantita - quantita < 0) {
            this.quantita = 0;
            return;
        }

        this.quantita -= quantita;
    }

    // Reservation
    public boolean isDisponibile(int quantita) {
        return this.quantita >= quantita;
    }

    // Status
    public String getStatus() {
        int disponibili = quantita;

        if (disponibili == 0) {
            if (prossimoRifornimento == null || prossimoRifornimento.getTime() < new Date().getTime()) {
                return "Non disponibile";
            }

            String data = ChronoUnit.DAYS.between(new Date().toInstant(), prossimoRifornimento.toInstant()) + "";

            return "⧗ In arrivo tra " + data + " giorni";
        }

        if (disponibili < 10) {
            return "⚠ In esaurimento. Disponibili solo " + disponibili + " pezzi";
        }

        if (disponibili == Integer.MAX_VALUE) {
            return "Disponibilità illimitata";
        }

        return "Disponibili " + disponibili + " unità.";
    }

    public String getColor() {
        int disponibili = quantita;

        if (disponibili == 0) {
            if (prossimoRifornimento == null || prossimoRifornimento.getTime() < new Date().getTime()) {
                return LibriUtils.DANGER; // danger (red)
            }

            return LibriUtils.WARNING;
        }

        if (disponibili < 10) {
            return LibriUtils.WARNING;
        }

        return LibriUtils.SUCCESS;
    }

    // Rifornimento
    public void rifornisci(int quantita) {
        this.quantita += quantita;
    }

    public void rifornisci(int quantita, Date prossimoRifornimento) {
        this.quantita += quantita;
        this.prossimoRifornimento = prossimoRifornimento;
    }

    public void rimuoviRifornimento() {
        this.prossimoRifornimento = null;
    }

    @Override
    public Rifornimento clone() {
        try {
            Rifornimento cloned = (Rifornimento) super.clone();

            cloned.prossimoRifornimento = this.prossimoRifornimento != null
                    ? (Date) this.prossimoRifornimento.clone()
                    : null;

            cloned.setId(null);

            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }

}

package me.leoo.springboot.libri.rifornimento;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.utils.LibriUtils;
import me.leoo.springboot.libri.utils.Sconto;
import me.leoo.utils.common.random.RandomUtil;
import me.leoo.utils.common.time.TimeUtil;

import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Rifornimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantita;
    private int prenotati;

    private double prezzo;

    @Nullable
    public Sconto sconto;

    private int giorniConsegna;

    @Temporal(TemporalType.TIMESTAMP)
    @Nullable
    private Date prossimoRifornimento;

    public Rifornimento(int quantita, double prezzo) {
        this(quantita, 0, prezzo, Sconto.from(prezzo, 15), 3, TimeUtil.fromNow(3, Calendar.DAY_OF_MONTH).getTime());
    }

    public Rifornimento(int quantita, int prenotati, double prezzo, Sconto sconto, int giorniConsegna, @Nullable Date prossimoRifornimento) {
        this.quantita = quantita;
        this.prenotati = prenotati;
        this.prezzo = prezzo;
        this.sconto = sconto;
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
    public int getDisponibili() {
        return quantita - prenotati;
    }

    public boolean isDisponibile(int quantita) {
        return getDisponibili() >= quantita;
    }

    public String addPrenotati(int prenotati) {
        if (this.prenotati + prenotati > quantita) {
            this.prenotati = quantita;
            return "Prenotazione riuscita.";
        }

        this.prenotati += prenotati;

        return "Prenotazione riuscita.";
    }

    public void removePrenotati(int prenotati) {
        if (this.prenotati - prenotati < 0) {
            this.prenotati = 0;
            return;
        }

        this.prenotati -= prenotati;
    }

    // Price

    /**
     * @return discounted price if present
     */
    @Transient
    public double getPrezzoTotale() {
        if (sconto == null) {
            return prezzo;
        }

        double scontoSoldi = sconto.getSconto(prezzo);

        if (scontoSoldi == 0) return prezzo;

        System.out.println("Prezzo: " + prezzo + ", Sconto: " + scontoSoldi);
        System.out.println("Prezzo totale: " + String.format("%.2f", prezzo - scontoSoldi));

        return LibriUtils.round(prezzo - scontoSoldi);
    }

    // Status
    @Transient
    public String getStatus() {
        //int disponibili = getDisponibili();
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

        return "Disponibile. Consegna in " + giorniConsegna + " giorni";
    }

    @Transient
    public String getColor() {
        //int disponibili = getDisponibili();
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


    // Update
    public Rifornimento updateFrom(Rifornimento rifornimento) {
        this.quantita = rifornimento.getQuantita();
        this.prenotati = rifornimento.getPrenotati();
        this.prezzo = rifornimento.getPrezzo();
        this.sconto = rifornimento.getSconto();
        this.giorniConsegna = rifornimento.getGiorniConsegna();
        this.prossimoRifornimento = rifornimento.getProssimoRifornimento();

        return this;
    }
}

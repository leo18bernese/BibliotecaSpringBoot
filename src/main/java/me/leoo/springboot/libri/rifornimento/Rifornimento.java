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
public class Rifornimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantita;
    private int prenotati;

    private double prezzo;
    public double sconto;

    private int giorniConsegna;

    @Temporal(TemporalType.TIMESTAMP)
    @Nullable
    private Date prossimoRifornimento;

    public Rifornimento(int quantita, double prezzo) {
        this(quantita, 0, prezzo, 0, 3, TimeUtil.fromNow(3, Calendar.DAY_OF_MONTH).getTime());
    }

    public Rifornimento(int quantita, int prenotati, double prezzo, double sconto, int giorniConsegna, @Nullable Date prossimoRifornimento) {
        this.quantita = quantita;
        this.prenotati = prenotati;
        this.prezzo = prezzo;
        this.sconto = sconto;
        this.giorniConsegna = giorniConsegna;
        this.prossimoRifornimento = RandomUtil.randomInt(0, 1) == 1 ? prossimoRifornimento : null;
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
    @Transient
    public double getPrezzoTotale() {
        if (sconto == 0) return prezzo;

        return prezzo - ((prezzo / 100) * sconto);
    }

    // Status
    @Transient
    public String getStatus() {
        if (quantita == 0) {
            if (prossimoRifornimento == null || prossimoRifornimento.getTime() < new Date().getTime()) {
                return "Non disponibile";
            }

            String data = ChronoUnit.DAYS.between(new Date().toInstant(), prossimoRifornimento.toInstant()) + "";

            return "In arrivo tra " + data + " giorni";
        }

        if (quantita < 10) {
            return "In esaurimento. Disponibili solo " + quantita + " pezzi";
        }

        return "Disponibile. Consegna in " + giorniConsegna + " giorni";
    }

    @Transient
    public String getColor() {
        if (quantita == 0) {
            if (prossimoRifornimento == null || prossimoRifornimento.getTime() < new Date().getTime()) {
                return LibriUtils.DANGER; // danger (red)
            }

            return LibriUtils.WARNING;
        }

        if (quantita < 10) {
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

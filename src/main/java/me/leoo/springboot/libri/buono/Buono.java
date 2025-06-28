package me.leoo.springboot.libri.buono;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utils.Sconto;

import java.util.Date;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Buono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codice;

    @Nullable
    public Sconto sconto;

    private Date inizioValidita;
    private Date fineValidita;

    private Date dataCreazione;
    private Date ultimaModifica;

    private int utilizzi;
    private int massimoUtilizzi;

    private int spesaMinima;
    private boolean cumulabile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id")
    @JsonIgnore
    private Utente utente;

    private StatoBuono stato;

    public Buono(String codice, Sconto sconto, Date inizioValidita, Date fineValidita, int utilizzi, int massimoUtilizzi, int spesaMinima, boolean cumulabile, Utente utente, StatoBuono stato) {
        this.codice = codice;
        this.sconto = sconto;
        this.inizioValidita = inizioValidita;
        this.fineValidita = fineValidita;
        this.dataCreazione = new Date();
        this.ultimaModifica = new Date();
        this.utilizzi = utilizzi;
        this.massimoUtilizzi = massimoUtilizzi;
        this.spesaMinima = spesaMinima;
        this.cumulabile = cumulabile;
        this.utente = utente;
        this.stato = stato;
    }

    public boolean validate(Utente user) {
        if (this.utente != null) {
            if (!this.utente.getId().equals(user.getId())) {
                throw new IllegalArgumentException("Il buono non appartiene all'utente specificato.");
            }
        }

        // Controlla se il buono è attivo e non scaduto
        if (!checkState()) {
            throw new IllegalStateException("Il buono non è attivo o è scaduto.");
        }

        Carrello carrello = user.getCarrello();
        if (carrello == null) {
            return false;
        }
        // Controlla se il buono è cumulabile
        if (!carrello.getCouponCodes().isEmpty() && !cumulabile) {
            throw new IllegalStateException("Il buono non è cumulabile con altri buoni attivi.");
        }

        // Controlla se la spesa minima è rispettata
        if (spesaMinima > 0 && carrello.getTotale() < spesaMinima) {
            throw new IllegalStateException("La spesa minima per utilizzare il buono non è stata raggiunta.");
        }

        return true;
    }

    /**
     * Check date validity and usage limits of the voucher.
     */
    public boolean checkState() {
        if (stato == StatoBuono.ATTIVO) {
            return isInPeriod() && utilizzi < massimoUtilizzi;
        }

        return false;
    }

    /**
     * Check if the voucher is currently valid based on its validity period.
     */
    public boolean isInPeriod() {
        Date now = new Date();

        return (inizioValidita == null || !now.before(inizioValidita)) &&
                (fineValidita == null || !now.after(fineValidita));
    }
}

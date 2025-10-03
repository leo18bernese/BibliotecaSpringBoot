package me.leoo.springboot.libri.libri.prezzo;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.LibroController;
import me.leoo.springboot.libri.utils.LibriUtils;
import me.leoo.springboot.libri.utils.Sconto;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Prezzo implements Cloneable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double prezzo;
    private Valuta valuta = Valuta.EUR;

    @Nullable
    public Sconto sconto;

    public Prezzo(double prezzo) {
        this.prezzo = prezzo;
    }

    public Prezzo(double prezzo, @Nullable Sconto sconto, Valuta valuta) {
        this.prezzo = prezzo;
        this.sconto = sconto;
        this.valuta = valuta;
    }

    /**
     * @return discounted price if present
     */
    public double getPrezzoTotale() {
        if (sconto == null) {
            return prezzo;
        }

        double scontoSoldi = sconto.getSconto(prezzo);

        if (scontoSoldi == 0) return prezzo;

        //System.out.println("Prezzo: " + prezzo + ", Sconto: " + scontoSoldi);
        //System.out.println("Prezzo totale: " + String.format("%.2f", prezzo - scontoSoldi));

        return LibriUtils.round(prezzo - scontoSoldi);
    }

    // Update price and discount
    public Prezzo updatePrice(LibroController.VarianteRequest request) {
        this.prezzo = request.prezzo();
        this.sconto = request.sconto();

        return this;
    }

    public Prezzo clone() {
        try {
            Prezzo cloned = (Prezzo) super.clone();

            cloned.setId(null);

            // Se Sconto è mutabile e implementa Cloneable, clonalo qui
            // cloned.sconto = this.sconto != null ? this.sconto.clone() : null;
            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}

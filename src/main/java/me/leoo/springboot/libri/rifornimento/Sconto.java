package me.leoo.springboot.libri.rifornimento;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.utils.LibriUtils;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sconto {
    private int percentuale;
    private double valore;

    public static Sconto from(double prezzo, double sconto) {
        double value = (prezzo / 100 * sconto);

        return new Sconto((int) sconto, LibriUtils.round(value));
    }
}

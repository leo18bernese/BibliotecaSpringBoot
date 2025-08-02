package me.leoo.springboot.libri.utils;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sconto {
    private int percentuale;
    private double valore;

    public double getSconto(double prezzo) {
        if (percentuale > 0 && percentuale <= 100) {
            return LibriUtils.round(prezzo / 100 * percentuale);
        }

        if (valore <= 0) return 0;

        return valore;
    }

    public static Sconto from(double prezzo, double sconto) {
        double value = (prezzo / 100 * sconto);

        return new Sconto((int) sconto, LibriUtils.round(value));
    }

}

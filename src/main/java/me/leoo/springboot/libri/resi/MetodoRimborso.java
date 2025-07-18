package me.leoo.springboot.libri.resi;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum MetodoRimborso {

    ORIGINALE("Originale", "Rimborso tramite metodo di pagamento originale"),
    SALDO_ACCOUNT("Saldo Account", "Rimborso sul saldo dell'account cliente. Sarà possibile utilizzarlo per acquisti futuri");

    private final String displayName;
    private final String descrizione;

    public String getName() {
        return name();
    }

}

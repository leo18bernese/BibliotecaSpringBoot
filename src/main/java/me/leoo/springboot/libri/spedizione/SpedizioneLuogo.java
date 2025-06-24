package me.leoo.springboot.libri.spedizione;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum SpedizioneLuogo {
    HOME("Casa o indirizzo di lavoro"),
    LOCKER("Locker"),
    POINT("Punto di ritiro");

    private final String descrizione;
}

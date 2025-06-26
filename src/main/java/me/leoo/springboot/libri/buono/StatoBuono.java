package me.leoo.springboot.libri.buono;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatoBuono {
    ATTIVO("Attivo", "Il buono è attivo e può essere utilizzato"),
    SCADUTO("Scaduto", "Il buono è scaduto e non può essere più utilizzato"),
    UTILIZZATO("Utilizzato", "Il buono è stato utilizzato e non può essere riutilizzato"),
    ANNULLATO("Annullato", "Il buono è stato annullato e non può essere utilizzato");

    private final String displayName;
    private final String descrizione;
}

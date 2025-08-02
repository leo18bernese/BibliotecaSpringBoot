package me.leoo.springboot.libri.resi.stato;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@RequiredArgsConstructor
@Getter
public enum StatoReso {

    RICHIESTO("Richiesto", "Il reso è stato richiesto ma non ancora accettato", false),
    DA_RESTITUIRE("Accettato", "Il reso è stato accettato e gli articoli devono essere restituiti", true),
    SPEDITO("Spedito", "Il reso è stato spedito e in attesa di essere ricevuto dal centro di elaborazione resi", true),
    RICEVUTO("Ricevuto", "Il reso è stato ricevuto e in attesa di elaborazione", true),
    ELABORATO("Elaborato", "Il reso è stato elaborato e il rimborso è in corso", true),

    EFFETTUATO("Effettuato", "Il reso è stato completato e il rimborso è stato effettuato", true),
    RESPINTO("Respinto", "Il reso è stato respinto e non sarà rimborsato", true),
    IN_ATTESA("In attesa", "Il reso è in attesa di ulteriori azioni da parte del cliente o del supporto", true),

    ANNULLATO_DA_CLIENTE("Annullato", "Il cliente ha annullato il reso", false),
    ANNULLATO_DA_SUPPORTO("Annullato dal supporto", "Il supporto ha annullato il reso per motivi specifici", false);

    private final String displayName;
    private final String descrizione;
    private final boolean updatableByAdmin;

    public static StatoReso[] getUpdatableStates() {
        return Arrays.stream(values()).filter(stato -> stato.updatableByAdmin).toArray(StatoReso[]::new);
    }
}

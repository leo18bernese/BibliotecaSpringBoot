package me.leoo.springboot.libri.resi.stato;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatoReso {

    RICHIESTO("Richiesto", "Il reso è stato richiesto ma non ancora accettato"),
    DA_RESTITUIRE("Accettato", "Il reso è stato accettato e gli articoli devono essere restituiti"),
    SPEDITO("Spedito", "Il reso è stato spedito e in attesa di essere ricevuto dal centro di elaborazione resi"),
    RICEVUTO("Ricevuto", "Il reso è stato ricevuto e in attesa di elaborazione"),
    ELABORATO("Elaborato", "Il reso è stato elaborato e il rimborso è in corso"),

    EFFETTUATO("Effettuato", "Il reso è stato completato e il rimborso è stato effettuato"),
    RESPINTO("Respinto", "Il reso è stato respinto e non sarà rimborsato"),
    IN_ATTESA("In attesa", "Il reso è in attesa di ulteriori azioni da parte del cliente o del supporto"),

    ANNULLATO_DA_CLIENTE("Annullato", "Il cliente ha annullato il reso"),
    ANNULLATO_DA_SUPPORTO("Annullato dal supporto", "Il supporto ha annullato il reso per motivi specifici");

    private final String displayName;
    private final String descrizione;
}

package me.leoo.springboot.libri.ordini;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatoOrdine {

    IN_ATTESA("In attesa", "L'ordine è stato ricevuto e in attesa di elaborazione.", "A breve gli articolo saranno raccolti e preparati per la spedizione."),
    IN_PREPARAZIONE("In preparazione", "L'ordine è in fase di preparazione.", "Gli articoli sono in fase di raccolta e imballaggio."),
    SPEDITO("Spedito", "L'ordine è stato spedito e in transito verso la destinazione.", "Puoi tracciare il tuo ordine con il numero di tracciamento fornito."),
    IN_CONSEGNA("In consegna", "L'ordine è in consegna e arriverà a breve.", "Assicurati di essere disponibile per ricevere il pacco. " +
            "Maggiori informazioni sulla consegna potrebbero essere fornite dal corriere."),
    CONSEGNATO("Consegnato", "L'ordine è stato consegnato con successo.", "Grazie per aver acquistato da noi! Se hai domande o problemi, contattaci."),

    ANNULLATO("Annullato", "L'ordine è stato annullato.", "Se hai domande sull'annullamento, contattaci per assistenza."),
    RIMBORSATO("Rimborsato", "L'ordine è stato rimborsato.", "Dettagli sulla pratica di restituzione sono disponibili nel tuo account."),
    ERRORE("Errore", "Si è verificato un errore durante l'elaborazione dell'ordine.", "Puoi vedere la causa dell'errore nel tuo ordine.");

    private final String displayName;
    private final String description;
    private final String nextStepOrInfo;
}

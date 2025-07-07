package me.leoo.springboot.libri.resi;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum MotivoReso {

    DIFETTOSO(
            "Prodotto Difettoso",
            "Il prodotto ricevuto è danneggiato, non funzionante o presenta difetti di fabbricazione.",
            "Un libro con pagine strappate o una copertina rovinata al momento della consegna.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto o video del difetto)
    ),
    NON_CONFORME(
            "Prodotto Non Conforme",
            "Il prodotto ricevuto non corrisponde alla descrizione o all'ordine effettuato.",
            "Ordinato un libro in edizione cartonata, ricevuto in edizione tascabile.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto del prodotto ricevuto e ordine)
    ),
    SBAGLIATO(
            "Prodotto Sbagliato",
            "È stato spedito un prodotto diverso da quello ordinato.",
            "Ordinato 'Il Signore degli Anelli', ricevuto 'Harry Potter'.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto del prodotto ricevuto)
    ),
    DANNEGGIATO_TRASPORTO(
            "Danneggiato Durante il Trasporto",
            "Il prodotto è arrivato danneggiato a causa del trasporto o dell'imballaggio inadeguato.",
            "Un libro con angoli schiacciati o copertina piegata a causa della spedizione.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto del pacco e del prodotto danneggiato)
    ),
    RIPENSAMENTO(
            "Diritto di Ripensamento",
            "Il cliente ha cambiato idea entro il periodo di recesso previsto (es. 14 giorni in UE).",
            "Il cliente decide di restituire un libro perché non lo vuole più.",
            true,  // Restituzione sempre necessaria
            true,  // Spese di restituzione a carico del cliente
            false  // Non necessarie prove, se entro i termini legali
    ),
    MANCANZA_ACCESSORI(
            "Mancanza di Accessori o Parti",
            "Il prodotto è incompleto, mancano parti o accessori descritti nell'offerta.",
            "Un libro con CD allegato, ma il CD non è presente.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto della confezione incompleta)
    ),
    NON_SODDISFACENTE(
            "Non Soddisfa le Aspettative",
            "Il prodotto è funzionante ma non risponde alle aspettative del cliente.",
            "Un libro con contenuti diversi da quanto il cliente si aspettava.",
            true,  // Restituzione sempre necessaria
            true,  // Spese di restituzione a carico del cliente
            false  // Non necessarie prove, se entro i termini di reso
    ),
    ORDINE_DOPPIO(
            "Ordine Doppio o Duplicato",
            "Ordine effettuato per errore ma troppo tardi per annullarlo.",
            "Il cliente si è accorto della quantità errata troppo tardi.",
            true,  // Restituzione sempre necessaria
            true,  // Spese di restituzione a carico del cliente
            false  // Non necessarie prove, se entro i termini di reso
    ),
    NON_AUTENTICO(
            "Prodotto Non Autentico",
            "Il prodotto sembra contraffatto o non originale.",
            "Un libro che appare stampato in modo non ufficiale o di bassa qualità.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto o video che evidenziano la non autenticità)
    ),
    SCADUTO(
            "Prodotto Scaduto o Non Valido",
            "Il prodotto ha una data di scadenza superata o non è valido per l'uso.",
            "Un libro con un codice digitale per contenuti online già scaduto.",
            true,  // Restituzione sempre necessaria
            false, // Spese di restituzione a carico del venditore
            true   // Necessarie prove (es. foto del codice o della data di scadenza)
    );

    private final String displayName;
    private final String descrizione;
    private final String esempi;

    @JsonIgnore
    private final boolean restituzioneSempre;

    @JsonIgnore
    private final boolean speseRestituzione;

    private final boolean proveRichieste;

    public String getName() {
        return name();
    }
}

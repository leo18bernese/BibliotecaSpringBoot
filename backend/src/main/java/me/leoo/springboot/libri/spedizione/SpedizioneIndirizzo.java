package me.leoo.springboot.libri.spedizione;

import jakarta.persistence.Embeddable;

@Embeddable
public record SpedizioneIndirizzo(String nome, String indirizzo, String citta, String provincia, String cap, String telefono) {

    public boolean isValid() {
        return nome != null && !nome.isBlank() &&
               indirizzo != null && !indirizzo.isBlank() &&
               citta != null && !citta.isBlank() &&
               provincia != null && !provincia.isBlank() &&
               cap != null && !cap.isBlank();
    }

    public String getFullAddress() {
        if (!isValid()) {
           return "Non valido";
        }

        return String.format("%s, %s %s (%s), Italia", indirizzo, cap, citta, provincia);
    }
}

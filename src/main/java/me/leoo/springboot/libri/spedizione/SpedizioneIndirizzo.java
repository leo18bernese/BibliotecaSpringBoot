package me.leoo.springboot.libri.spedizione;

import jakarta.persistence.Embeddable;

@Embeddable
public record SpedizioneIndirizzo(String nome, String indirizzo, String citta, String provincia, String cap, String telefono) {
}

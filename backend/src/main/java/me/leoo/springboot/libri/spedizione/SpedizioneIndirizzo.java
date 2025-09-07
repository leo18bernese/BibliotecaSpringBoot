package me.leoo.springboot.libri.spedizione;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "spedizione_indirizzo")
public class SpedizioneIndirizzo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String indirizzo;

    @Column(nullable = false)
    private String citta;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String cap;

    private String telefono;
    // Costruttori
    public SpedizioneIndirizzo(String nome, String indirizzo, String citta, String provincia, String cap, String telefono) {
        this.nome = nome;
        this.indirizzo = indirizzo;
        this.citta = citta;
        this.provincia = provincia;
        this.cap = cap;
        this.telefono = telefono;
    }

    // Metodi di business
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

package me.leoo.springboot.libri.libri.autore;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Autore {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String nome;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String descrizione;

    public Autore(String nome, String descrizione) {
        this.nome = nome;
        this.descrizione = descrizione;
    }
}

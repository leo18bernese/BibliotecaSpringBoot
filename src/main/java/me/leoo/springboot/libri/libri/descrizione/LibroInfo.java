package me.leoo.springboot.libri.libri.descrizione;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.libri.Libro;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LibroInfo {

    @Id
    private Long prodottoId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "prodotto_id")
    @JsonIgnore
    private Libro libro;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    @JsonIgnore
    private String descrizione;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    @JsonIgnore
    private String produttore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "libro_caratteristiche", joinColumns = @JoinColumn(name = "libro_info_id"))
    @MapKeyColumn(name = "caratteristica")
    @Column(name = "valore")
    private Map<String, String> caratteristiche;

    public LibroInfo(Libro prodotto, String descrizione, String produttore) {
        this.libro = prodotto;
        this.descrizione = descrizione;
        this.produttore = produttore;
        this.caratteristiche = new HashMap<>();

        int random = new Random().nextInt(3);

        switch (random) {
            case 0 -> {
                addCaratteristica("Colore", "Nero");
                addCaratteristica("altezza", "20");
                addCaratteristica("larghezza", "15");
                addCaratteristica("stile", "Moderno");
            }

            case 1 -> {
                addCaratteristica("Colore", "Bianco");
                addCaratteristica("altezza", "22");
                addCaratteristica("larghezza", "16");
                addCaratteristica("stile", "Classico");
            }

            case 2 -> {
                addCaratteristica("Colore", "Blu");
                addCaratteristica("altezza", "18");
                addCaratteristica("larghezza", "14");
                addCaratteristica("stile", "Minimalista");
            }

        }

    }

    public void addCaratteristica(String chiave, String valore) {
        this.caratteristiche.put(chiave, valore);
    }

    public boolean hasCaratteristica(String chiave) {
        return this.caratteristiche.containsKey(chiave);
    }

    public void removeCaratteristica(String chiave) {
        this.caratteristiche.remove(chiave);
    }

    public String getDescrizioneHtml() {
        return new MarkdownService().convertToHtml(this.descrizione);
    }

    public String getAutoreHtml() {
        return new MarkdownService().convertToHtml(this.produttore);
    }
}
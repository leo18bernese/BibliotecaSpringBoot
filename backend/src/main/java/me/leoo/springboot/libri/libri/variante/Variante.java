package me.leoo.springboot.libri.libri.variante;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroController;
import me.leoo.springboot.libri.libri.descrizione.LibroDimension;
import me.leoo.springboot.libri.libri.miscellaneous.DeliveryPackage;
import me.leoo.springboot.libri.libri.prezzo.Prezzo;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.utils.common.string.StringUtil;

import java.util.*;
import java.util.stream.Collectors;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class Variante implements Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JsonIgnore
    private Libro libro;

    private String nome;

    @OneToOne(cascade = CascadeType.ALL)
    private Prezzo prezzo;

    @OneToOne(cascade = CascadeType.ALL)
    private Rifornimento rifornimento;

    private LibroDimension dimensioni;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> recensioni = List.of(); // Recensioni specifiche per questa variante

    @ElementCollection(fetch = FetchType.EAGER)
    private Map<String, String> attributiSpecifici = new HashMap<>();

    public Variante(Libro libro, String nome, Prezzo prezzo, Rifornimento rifornimento, LibroDimension dimensioni) {
        this.libro = libro;
        this.nome = nome;
        this.prezzo = prezzo;
        this.rifornimento = rifornimento;
        this.dimensioni = dimensioni;
    }

    public String getDynamicName() {
        return attributiSpecifici.values()
                .stream()
                .map(StringUtil::capitalize)
                .filter(s -> Objects.nonNull(s) && !s.isBlank())
                .collect(Collectors.joining(" "));
    }

    public void addAttributo(String key, String value) {
        this.attributiSpecifici.put(key, value);
    }

    public void addAttributi(Map<String, String> attributi) {
        if (attributi == null) return;

        this.attributiSpecifici.putAll(attributi);
    }

    public void removeAttributo(String key) {
        this.attributiSpecifici.remove(key);
    }

    public DeliveryPackage getDeliveryPackage() {
        return DeliveryPackage.getMostSuitable(dimensioni);
    }

    public Variante updateFromRequest(LibroController.VarianteRequest request) {
        this.nome = request.nome();
        this.prezzo.updatePrice(request);
        this.dimensioni = request.dimensioni();

        this.attributiSpecifici = request.attributi();

        return this;
    }

    @Override
    public Variante clone() {
        try {
            Variante cloned = (Variante) super.clone();
            cloned.prezzo = this.prezzo != null ? this.prezzo.clone() : null;
            cloned.rifornimento = this.rifornimento != null ? this.rifornimento.clone() : null;
            cloned.dimensioni = this.dimensioni.from();
            cloned.recensioni = new ArrayList<>(); // leave empty, do not clone reviews
            cloned.attributiSpecifici = new HashMap<>(this.attributiSpecifici);
            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }


}
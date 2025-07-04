package me.leoo.springboot.libri.resi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.OrdineItem;

import java.util.*;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Reso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "reso", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ResoItem> items = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "reso_stati", joinColumns = @JoinColumn(name = "reso_id"))
    @MapKeyColumn(name = "stato")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "data_aggiornamento")
    private Map<StatoReso, Date> stati = new HashMap<>();
}

package me.leoo.springboot.libri.resi;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class ResoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reso_id")
    @JsonIgnore
    private Reso reso;


}

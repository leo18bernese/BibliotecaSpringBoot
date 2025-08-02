package me.leoo.springboot.libri.libri.caratteristiche;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.util.Map;

@Entity
@Getter
@Setter
public class CaratteristicaOpzione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCaratteristica;

    @Column(nullable = false)
    private String valoreOpzione;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private Map<String, Object> metadata;
}
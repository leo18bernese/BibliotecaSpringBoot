package me.leoo.springboot.libri.analytics.ranking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "rankings")
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private Long categoryId;

    private RankingType rankingType;

    private Integer position;
    private double value;

    private Date lastUpdated;

    public Ranking(Long productId, Long categoryId, RankingType rankingType, Integer position, double value) {
        this.productId = productId;
        this.categoryId = categoryId;
        this.rankingType = rankingType;
        this.position = position;
        this.value = value;
        this.lastUpdated = new Date();
    }
}

package me.leoo.springboot.libri.analytics.ranking;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RankingRepository extends JpaRepository<Ranking, Long> {

    List<Ranking> findByRankingTypeOrderByPositionAsc(RankingType rankingType);

}

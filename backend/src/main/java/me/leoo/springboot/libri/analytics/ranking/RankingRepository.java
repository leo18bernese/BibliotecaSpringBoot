package me.leoo.springboot.libri.analytics.ranking;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RankingRepository extends JpaRepository<Ranking, Long> {

    List<Ranking> findByRankingTypeOrderByPositionAsc(RankingType rankingType);

    List<Ranking> findTop3ByRankingTypeOrderByPositionAsc(RankingType rankingType);

    @Query("SELECT r.productId FROM Ranking r WHERE r.rankingType = :rankingType AND r.position <= 3 ORDER BY r.position ASC LIMIT 3")
    List<Long> findTop3ProductIdsByRankingType(RankingType rankingType);
}

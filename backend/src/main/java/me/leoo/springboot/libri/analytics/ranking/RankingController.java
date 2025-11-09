package me.leoo.springboot.libri.analytics.ranking;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;


    @GetMapping("/{type}/ids")
    public ResponseEntity<List<Long>> getRankingProductIds(@PathVariable RankingType type) {
        return ResponseEntity.ok(rankingService.getRankingProductIdsByType(type));
    }

    @GetMapping("/{type}/content")
    public ResponseEntity<List<Ranking>> getRankings(@PathVariable RankingType type) {
        return ResponseEntity.ok(rankingService.getRankingsByType(type));
    }

    @GetMapping("/{type}/top3")
    public ResponseEntity<List<Long>> getTop3Rankings(@PathVariable RankingType type) {
        return ResponseEntity.ok(rankingService.getTop3RankingsByType(type));
    }

}


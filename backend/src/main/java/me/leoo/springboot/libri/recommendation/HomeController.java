package me.leoo.springboot.libri.recommendation;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final LibroRecommendationService recommendationService;

    @Autowired
    public HomeController(LibroRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/libri")
    public List<Long> getHomePageBooks(
            @RequestParam(defaultValue = "20") int limit
    ) {
        return recommendationService.getHomepage(limit).stream()
                .map(Libro::getId)
                .collect(Collectors.toList());
    }
}
package me.leoo.springboot.libri.libri.recommendation;
; // Assicurati che il percorso del pacchetto sia corretto
import me.leoo.springboot.libri.libri.Libro;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final LibroRecommendationService recommendationService;

    @Autowired
    public HomeController(LibroRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/libri") // Ho cambiato il path da /products a /libri per essere più specifico
    public List<Long> getHomePageBooks(
            @RequestParam(defaultValue = "20") int limit) { // Il front-end può specificare quanti libri vuole
        return recommendationService.getHomepage(limit).stream()
                .map(Libro::getId) // Restituisce solo gli ID dei libri
                .collect(Collectors.toList()) ;// Converte in una lista di interi
    }
}
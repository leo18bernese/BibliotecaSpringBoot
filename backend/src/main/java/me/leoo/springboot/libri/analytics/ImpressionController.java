package me.leoo.springboot.libri.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/impressions")
@RequiredArgsConstructor
public class ImpressionController {

    private final InteractionRepository repository;
    private final InteractionService service;

    public record InteractionRequest(InteractionEnum type, Long productId, Long userId) {
    }

    @PostMapping("/event")
    public void trackImpression(@RequestBody InteractionRequest request) {
        service.trackEvent(request.userId, request.productId, request.type);
    }

    @GetMapping("/all/{productId}")
    public Iterable<UserProductInteraction> getImpressionsForProduct(@PathVariable Long productId) {
        return repository.getAllByProductId(productId);
    }

}

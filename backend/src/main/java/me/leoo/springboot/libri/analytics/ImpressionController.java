package me.leoo.springboot.libri.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

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

    @GetMapping("/unique/{productId}")
    public Map<InteractionEnum, Integer> countAllUniqueEvents(@PathVariable Long productId) {
        Iterable<UserProductInteraction> interactions = repository.getAllByProductId(productId);
        Map<InteractionEnum, Integer> totalUniqueMap = new HashMap<>();
        long intervalMillis = 12 * 60 * 60 * 1000; // 24 hours

        for (InteractionEnum interaction : InteractionEnum.values()) {
            totalUniqueMap.put(interaction, 0);
        }

        for (UserProductInteraction interaction : interactions) {
            for (InteractionEnum eventType : InteractionEnum.values()) {
                totalUniqueMap.compute(eventType, (k, currentCount) ->
                        currentCount + interaction.countUniqueEvents(eventType, intervalMillis)
                );
            }
        }
        System.out.println(totalUniqueMap);
        return totalUniqueMap;
    }

    @GetMapping("/unique/{productId}/{eventType}")
    public int countUniqueEvents(@PathVariable Long productId, @PathVariable InteractionEnum eventType) {
        Iterable<UserProductInteraction> interactions = repository.getAllByProductId(productId);
        int totalUnique = 0;
        long intervalMillis = 24 * 60 * 60 * 1000; // 24 hours
        for (UserProductInteraction interaction : interactions) {

            totalUnique += interaction.countUniqueEvents(eventType, intervalMillis);
        }
        return totalUnique;
    }
}

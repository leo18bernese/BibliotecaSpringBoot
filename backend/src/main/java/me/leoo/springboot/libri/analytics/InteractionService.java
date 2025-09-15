package me.leoo.springboot.libri.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;

    public void trackEvent(Long userId, Long productId, InteractionEnum eventType) {
        Optional<UserProductInteraction> existingInteraction = interactionRepository.findByProductIdAndUserId(productId, userId);
        UserProductInteraction interaction;

        interaction = existingInteraction.orElseGet(() -> new UserProductInteraction(productId, userId));

        interaction.addInteraction(eventType, new Date());
        interactionRepository.save(interaction);
    }


}
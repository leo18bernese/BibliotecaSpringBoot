package me.leoo.springboot.libri.analytics;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "product_interactions")
@Getter
@Setter
@NoArgsConstructor
public class UserProductInteraction {

    @Id
    private String id;

    private Long productId;
    private Long userId;

    private Map<InteractionEnum, Integer> counts = new HashMap<>();

    private List<InteractionEvent> events = new ArrayList<>();

    public UserProductInteraction(Long productId, Long userId) {
        this.productId = productId;
        this.userId = userId;

        for (InteractionEnum interaction : InteractionEnum.values()) {
            counts.put(interaction, 0);
        }
    }

    public void addInteraction(InteractionEnum eventType, Date timestamp) {
        counts.put(eventType, counts.getOrDefault(eventType, 0) + 1);
        events.add(new InteractionEvent(eventType, timestamp));
    }

    public int countUniqueEvents(InteractionEnum eventType, long intervalMillis) {
        events.sort(Comparator.comparing(InteractionEvent::timestamp));

        int uniqueCount = 0;
        Date lastCounted = null;
        for (InteractionEvent event : events) {
            if (event.type() == eventType) {
                if (lastCounted == null || event.timestamp().getTime() - lastCounted.getTime() >= intervalMillis) {
                    uniqueCount++;
                    lastCounted = event.timestamp();
                }
            }
        }
        return uniqueCount;
    }
}

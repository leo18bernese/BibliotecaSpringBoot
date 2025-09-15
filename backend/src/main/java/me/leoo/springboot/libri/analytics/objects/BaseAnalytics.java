package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public abstract class BaseAnalytics {

    @Id
    protected String id;

    protected Long productId;

    protected Date date;
    protected Map<InteractionEnum, Integer> counts = new HashMap<>();

    public BaseAnalytics(Long productId, Date date) {
        this.productId = productId;
        this.date = date;
    }

    public void addInteraction(InteractionEnum eventType) {
        counts.put(eventType, counts.getOrDefault(eventType, 0) + 1);
    }

    public Integer getCount(InteractionEnum eventType) {
        return counts.getOrDefault(eventType, 0);
    }
}

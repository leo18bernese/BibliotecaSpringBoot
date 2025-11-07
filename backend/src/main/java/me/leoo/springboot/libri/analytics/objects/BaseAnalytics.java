package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.data.annotation.Id;

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
    protected Double totalRevenue = 0.0;
    protected Integer totalUnitsSold = 0;

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

    public void addRevenue(Double amount) {
        this.totalRevenue += amount;
    }

    public void addUnitsSold(Integer quantity) {
        this.totalUnitsSold += quantity;
    }
}

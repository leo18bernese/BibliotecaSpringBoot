package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@NoArgsConstructor
@Document(collection = "all_time_analytics")
@Getter
public class AllTimeAnalytics extends BaseAnalytics {

    private Long categoryId;

    public AllTimeAnalytics(Long productId, Long categoryId) {
        super(productId, null); // La data non è rilevante per le statistiche all-time

        this.categoryId = categoryId;
    }
}


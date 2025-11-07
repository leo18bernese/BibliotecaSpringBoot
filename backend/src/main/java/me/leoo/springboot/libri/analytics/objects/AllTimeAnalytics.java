package me.leoo.springboot.libri.analytics.objects;

import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@NoArgsConstructor
@Document(collection = "all_time_analytics")
public class AllTimeAnalytics extends BaseAnalytics {

    public AllTimeAnalytics(Long productId) {
        super(productId, null); // La data non è rilevante per le statistiche all-time
    }
}


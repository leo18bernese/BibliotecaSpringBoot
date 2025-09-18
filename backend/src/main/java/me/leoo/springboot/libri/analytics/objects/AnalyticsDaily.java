package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Document(collection = "analytics_daily")
public class AnalyticsDaily extends BaseAnalytics {

    private Date timeBucket;

    public AnalyticsDaily(Long productId, Date date) {
        super(productId, date);
    }
}

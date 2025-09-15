package me.leoo.springboot.libri.analytics.objects;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "analytics_daily")
public class AnalyticsDaily extends BaseAnalytics {

    public AnalyticsDaily(Long productId, Date date) {
        super(productId, date);
    }
}

package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Getter
@Document(collection = "analytics_hourly")
public class AnalyticsHourly extends BaseAnalytics {

    @Indexed(expireAfter = "14d")
    private Date timeBucket;

   public AnalyticsHourly(Long productId, Date date) {
        super(productId, date);
    }
}

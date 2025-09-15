package me.leoo.springboot.libri.analytics.objects;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "analytics_hourly")
public class AnalyticsHourly extends BaseAnalytics {

    @Field("timeBucket")
    @Indexed(expireAfter = "14d")
    private Date date;

    public AnalyticsHourly(Long productId, Date date) {
        super(productId, date);
    }
}

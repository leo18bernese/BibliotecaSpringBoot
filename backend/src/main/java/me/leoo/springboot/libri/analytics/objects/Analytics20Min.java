package me.leoo.springboot.libri.analytics.objects;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "analytics_20min")
public class Analytics20Min extends BaseAnalytics {

    @Field("timeBucket")
    @Indexed(expireAfter = "3d")
    private Date date;

    public Analytics20Min(Long productId, Date date) {
        super(productId, date);
    }
}

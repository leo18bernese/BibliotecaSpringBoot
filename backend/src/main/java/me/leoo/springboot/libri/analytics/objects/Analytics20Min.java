package me.leoo.springboot.libri.analytics.objects;

import lombok.Getter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Document(collection = "analytics_20min")
public class Analytics20Min extends BaseAnalytics {

    @Indexed(expireAfter = "3d")
    private Date timeBucket;

    public Analytics20Min(Long productId, Date date) {
        super(productId, date);
    }
}

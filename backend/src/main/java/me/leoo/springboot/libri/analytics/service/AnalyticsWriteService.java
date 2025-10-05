package me.leoo.springboot.libri.analytics.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
@RequiredArgsConstructor
public class AnalyticsWriteService {

    private final MongoTemplate mongoTemplate;

    public void recordEvent(Long productId, Long userId, InteractionEnum eventType, Date timestamp) {
        // Incrementa tutti i livelli di aggregazione in parallelo
        CompletableFuture.allOf(
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_20min", productId, userId, eventType, roundTo20Min(timestamp))),
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_hourly", productId, userId, eventType, roundToHour(timestamp))),
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_daily", productId, userId, eventType, roundToDay(timestamp)))
        ).join();
    }

    public void recordEvents(Long productId, Long userId, Map<InteractionEnum, Integer> events, Date timestamp) {
        // Batch insert per performance migliori
        events.forEach((eventType, count) -> {
            if (count > 0) {
                incrementMetric("analytics_20min", productId, userId, eventType, roundTo20Min(timestamp), count);
                incrementMetric("analytics_hourly", productId, userId, eventType, roundToHour(timestamp), count);
                incrementMetric("analytics_daily", productId, userId, eventType, roundToDay(timestamp), count);
            }
        });
    }

    private void incrementMetric(String collection, Long productId, Long userId, InteractionEnum eventType, Date timeBucket) {
        incrementMetric(collection, productId, userId,eventType, timeBucket, 1);
    }

    private void incrementMetric(String collection, Long productId, Long userId, InteractionEnum eventType, Date timeBucket, int count) {

        Query query = new Query(
                Criteria.where("productId").is(productId)
                        .and("timeBucket").is(timeBucket)
        );

        Update update = new Update().inc("counts." + eventType.name(), count);
        //System.out.println("Incrementing " + eventType.name() + " by " + count + " for productId: " + productId + " in collection: " + collection);
        //System.out.println("userId: " + userId);
        if (userId != null) {
            update.inc("uniqueUsers." + eventType.name(), 1);
        }

        mongoTemplate.upsert(query, update, collection);
    }

    private Date roundTo20Min(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int minutes = cal.get(Calendar.MINUTE);
        int roundedMinutes = (minutes / 20) * 20;
        cal.set(Calendar.MINUTE, roundedMinutes);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private Date roundToHour(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private Date roundToDay(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
}
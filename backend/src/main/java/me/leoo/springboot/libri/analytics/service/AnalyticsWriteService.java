package me.leoo.springboot.libri.analytics.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.jetbrains.annotations.Nullable;
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

    public void recordEvent(Long productId, @Nullable Long categoryId, Long userId, InteractionEnum eventType, Date timestamp) {
        // Incrementa tutti i livelli di aggregazione in parallelo
        CompletableFuture.allOf(
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_20min", productId, null, userId, eventType, roundTo20Min(timestamp))),
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_hourly", productId, null, userId, eventType, roundToHour(timestamp))),
                CompletableFuture.runAsync(() ->
                        incrementMetric("analytics_daily", productId, null, userId, eventType, roundToDay(timestamp))),
                CompletableFuture.runAsync(() ->
                        incrementMetric("all_time_analytics", productId, categoryId, userId, eventType, null))
        ).join();
    }

    public void recordEvents(Long productId, @Nullable Long categoryId, Long userId, Map<InteractionEnum, Integer> events, Date timestamp) {
        // Batch insert per performance migliori
        events.forEach((eventType, count) -> {
            if (count > 0) {
                incrementMetric("analytics_20min", productId, null, userId, eventType, roundTo20Min(timestamp), count);
                incrementMetric("analytics_hourly", productId, null, userId, eventType, roundToHour(timestamp), count);
                incrementMetric("analytics_daily", productId, null, userId, eventType, roundToDay(timestamp), count);
                incrementMetric("all_time_analytics", productId, categoryId, userId, eventType, null, count);
            }
        });
    }

    private void incrementMetric(String collection, Long productId, @Nullable Long categoryId, Long userId, InteractionEnum eventType, Date timeBucket) {
        incrementMetric(collection, productId, categoryId, userId, eventType, timeBucket, 1);
    }

    private void incrementMetric(String collection, Long productId, @Nullable Long categoryId, Long userId, InteractionEnum eventType, Date timeBucket, int count) {

        Query query = new Query(
                Criteria.where("productId").is(productId)
        );

        if (timeBucket != null) {
            query.addCriteria(Criteria.where("timeBucket").is(timeBucket));
        }

        if (categoryId != null) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }

        Update update = new Update().inc("counts." + eventType.name(), count);
        //System.out.println("Incrementing " + eventType.name() + " by " + count + " for productId: " + productId + " in collection: " + collection);
        //System.out.println("userId: " + userId);
        if (userId != null) {
            update.inc("uniqueUsers." + eventType.name(), 1);
        }

        mongoTemplate.upsert(query, update, collection);
    }

    // for totalRevenue and totalUnitsSold initialization
    public void incrementBaseValues(String collection, Long productId,
                                     @Nullable Long categoryId, Date timeBucket,
                                     String eventType, Integer count) {
        Query query = new Query(
                Criteria.where("productId").is(productId)
        );

        if (timeBucket != null) {
            query.addCriteria(Criteria.where("timeBucket").is(timeBucket));
        }

        if (categoryId != null) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }

        System.out.println("Initializing " + eventType + " to " + count + " for productId: " + productId + " in collection: " + collection);

        Update update = new Update().inc(eventType, count);

        System.out.println("Query: " + query);
        System.out.println("Update: " + update);

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
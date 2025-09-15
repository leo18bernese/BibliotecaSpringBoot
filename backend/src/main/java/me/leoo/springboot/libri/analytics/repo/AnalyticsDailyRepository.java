package me.leoo.springboot.libri.analytics.repo;

import me.leoo.springboot.libri.analytics.objects.AnalyticsDaily;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AnalyticsDailyRepository extends MongoRepository<AnalyticsDaily, String> {

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1 } }")
    List<AnalyticsDaily> findByProductIdFromTime(Long productId, Date startTime);

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1, $lt: ?2 } }")
    List<AnalyticsDaily> findByProductIdAndTimeRange(Long productId, Date startTime, Date endTime);

    @Query("{ 'productId': { $in: ?0 }, 'timeBucket': { $gte: ?1 } }")
    List<AnalyticsDaily> findByProductIdsFromTime(List<Long> productIds, Date startTime);

    @Query(value = "{ 'productId': ?0 }", sort = "{ 'timeBucket': -1 }")
    List<AnalyticsDaily> findByProductIdOrderByTimeBucketDesc(Long productId, Pageable pageable);
}

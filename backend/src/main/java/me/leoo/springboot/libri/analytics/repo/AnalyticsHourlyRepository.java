package me.leoo.springboot.libri.analytics.repo;

import me.leoo.springboot.libri.analytics.objects.AnalyticsDaily;
import me.leoo.springboot.libri.analytics.objects.AnalyticsHourly;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AnalyticsHourlyRepository extends MongoRepository<AnalyticsHourly, String> {

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1 } }")
    List<AnalyticsHourly> findByProductIdFromTime(Long productId, Date startTime);

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1, $lt: ?2 } }")
    List<AnalyticsHourly> findByProductIdAndTimeRange(Long productId, Date startTime, Date endTime);

    @Query("{ 'productId': { $in: ?0 }, 'timeBucket': { $gte: ?1 } }")
    List<AnalyticsHourly> findByProductIdsFromTime(List<Long> productIds, Date startTime);
}

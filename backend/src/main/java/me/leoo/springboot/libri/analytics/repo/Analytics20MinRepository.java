package me.leoo.springboot.libri.analytics.repo;

import me.leoo.springboot.libri.analytics.objects.Analytics20Min;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface Analytics20MinRepository extends MongoRepository<Analytics20Min, String> {

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1 } }")
    List<Analytics20Min> findByProductIdFromTime(Long productId, Date startTime);

    @Query("{ 'productId': ?0, 'timeBucket': { $gte: ?1, $lt: ?2 } }")
    List<Analytics20Min> findByProductIdAndTimeRange(Long productId, Date startTime, Date endTime);

    @Query("{ 'productId': { $in: ?0 }, 'timeBucket': { $gte: ?1 } }")
    List<Analytics20Min> findByProductIdsFromTime(List<Long> productIds, Date startTime);
}


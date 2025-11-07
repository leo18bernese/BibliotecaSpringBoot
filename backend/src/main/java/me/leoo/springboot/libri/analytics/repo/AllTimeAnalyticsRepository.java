package me.leoo.springboot.libri.analytics.repo;

import me.leoo.springboot.libri.analytics.objects.AllTimeAnalytics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllTimeAnalyticsRepository extends MongoRepository<AllTimeAnalytics, String> {

    Optional<AllTimeAnalytics> findByProductId(Long productId);

    List<AllTimeAnalytics> findTop10ByOrderByTotalRevenueDesc();
    List<AllTimeAnalytics> findTop10ByOrderByTotalUnitsSoldDesc();

    @Query(value = "{}", sort = "{ 'counts.VIEW' : -1 }")
    List<AllTimeAnalytics> findTop10Viewed();

    @Query(value = "{}", sort = "{ 'counts.ADD_TO_WISHLIST' : -1 }")
    List<AllTimeAnalytics> findTop10Wished();
}

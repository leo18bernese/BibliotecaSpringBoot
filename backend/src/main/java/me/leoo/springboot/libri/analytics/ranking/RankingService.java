package me.leoo.springboot.libri.analytics.ranking;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import me.leoo.springboot.libri.analytics.objects.AllTimeAnalytics;
import me.leoo.springboot.libri.analytics.repo.AllTimeAnalyticsRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final AllTimeAnalyticsRepository analyticsRepository;
    private final RankingRepository rankingRepository;


    // ogni 1 minuti
    @Scheduled(cron = "0 */1 * * * *")
    public void updateRankings() {


        System.out.println("Updating rankings...");

        rankingRepository.deleteAll();
        System.out.println("Cleared existing rankings.");

        System.out.println(getTopProductsByRevenue());

        updateRanking(RankingType.BEST_SELLERS_REVENUE, getTopProductsByRevenue());
        updateRanking(RankingType.BEST_SELLERS_UNITS, getTopProductsByUnitsSold());
        updateRanking(RankingType.MOST_VIEWED, getTopViewedProducts());
        updateRanking(RankingType.MOST_WISHED, getTopWishedProducts());
    }

    private void updateRanking(RankingType type, List<AllTimeAnalytics> analytics) {
        System.out.println("Updating ranking for type: " + type + " with " + analytics.size() + " products");

        for (int i = 0; i < analytics.size(); i++) {
            AllTimeAnalytics analytic = analytics.get(i);
            double value = 0;

            switch (type) {
                case BEST_SELLERS_REVENUE -> value = analytic.getTotalRevenue();
                case BEST_SELLERS_UNITS -> value = analytic.getTotalUnitsSold();
                case MOST_VIEWED -> value = analytic.getCount(InteractionEnum.VIEW);
                case MOST_WISHED -> value = analytic.getCount(InteractionEnum.ADD_TO_WISHLIST);
            }

            Ranking ranking = new Ranking(analytic.getProductId(), analytic.getCategoryId(), type, i + 1, value);
            rankingRepository.save(ranking);
        }
    }

    private List<AllTimeAnalytics> getTopProductsByRevenue() {
        System.out.println("Fetching top products by revenue...");
        return analyticsRepository.findTop10ByOrderByTotalRevenueDesc();
    }

    private List<AllTimeAnalytics> getTopProductsByUnitsSold() {
        System.out.println("Fetching top products by units sold...");
        return analyticsRepository.findTop10ByOrderByTotalUnitsSoldDesc();
    }

    private List<AllTimeAnalytics> getTopViewedProducts() {
        System.out.println("Fetching top viewed products...");
        return analyticsRepository.findTop10Viewed(Pageable.ofSize(10));
    }

    private List<AllTimeAnalytics> getTopWishedProducts() {
        System.out.println("Fetching top wished products...");
        return analyticsRepository.findTop10Wished(Pageable.ofSize(10));
    }

    //public methods
    public List<Ranking> getRankingsByType(RankingType type) {
        return rankingRepository.findByRankingTypeOrderByPositionAsc(type);
    }

    public List<Long> getRankingProductIdsByType(RankingType type) {
        return rankingRepository.findTop10ProductIdsByRankingType(type);
    }

    public List<Long> getTop3RankingsByType(RankingType type) {
        return rankingRepository.findTop3ProductIdsByRankingType(type);
    }

}

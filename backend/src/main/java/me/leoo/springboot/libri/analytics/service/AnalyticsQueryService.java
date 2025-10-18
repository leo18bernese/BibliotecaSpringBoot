package me.leoo.springboot.libri.analytics.service;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import me.leoo.springboot.libri.analytics.dto.AnalyticsComparisonDTO;
import me.leoo.springboot.libri.analytics.dto.AnalyticsSummaryDTO;
import me.leoo.springboot.libri.analytics.dto.ProductAnalyticsDTO;
import me.leoo.springboot.libri.analytics.dto.TimeSeriesPointDTO;
import me.leoo.springboot.libri.analytics.objects.Analytics20Min;
import me.leoo.springboot.libri.analytics.objects.AnalyticsDaily;
import me.leoo.springboot.libri.analytics.objects.AnalyticsHourly;
import me.leoo.springboot.libri.analytics.objects.BaseAnalytics;
import me.leoo.springboot.libri.analytics.repo.Analytics20MinRepository;
import me.leoo.springboot.libri.analytics.repo.AnalyticsDailyRepository;
import me.leoo.springboot.libri.analytics.repo.AnalyticsHourlyRepository;
import me.leoo.utils.common.time.TimeUtil;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsQueryService {

    private final Analytics20MinRepository analytics20MinRepository;
    private final AnalyticsHourlyRepository analyticsHourlyRepository;
    private final AnalyticsDailyRepository analyticsDailyRepository;

    // ===== DASHBOARD OVERVIEW =====

    public AnalyticsSummaryDTO getDashboardOverview(Long productId) {
        Date now = new Date();
        Date last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        Date last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        Date last30d = new Date(now.getTime() - (30L * 24 * 60 * 60 * 1000));

        // Usa risoluzione appropriata per periodo
        System.out.println("getting hourly metrics for last 24h");
        Map<InteractionEnum, Integer> metrics24h = getTotalMetricsHourly(productId, last24h, now);
        System.out.println("getting daily metrics for last 7d");
        Map<InteractionEnum, Integer> metrics7d = getTotalMetricsDaily(productId, last7d, now);
        System.out.println("getting daily metrics for last 30d");
        Map<InteractionEnum, Integer> metrics30d = getTotalMetricsDaily(productId, last30d, now);

        System.out.println(metrics7d);

        return AnalyticsSummaryDTO.builder()
                .productId(productId)
                .last24Hours(metrics24h)
                .last7Days(metrics7d)
                .last30Days(metrics30d)
                .build();
    }

    // ===== TIME SERIES =====

    public List<TimeSeriesPointDTO> getTimeSeriesData(Long productId, InteractionEnum metric, String period, String resolution) {
        Date endTime = new Date();
        Date startTime = calculateStartTime(endTime, period);

        return switch (resolution) {
            case "20min" -> getTimeSeries20Min(productId, metric, startTime, endTime);
            case "hourly" -> getTimeSeriesHourly(productId, metric, startTime, endTime);
            default -> getTimeSeriesDaily(productId, metric, startTime, endTime);
        };
    }

    private List<TimeSeriesPointDTO> getTimeSeries20Min(Long productId, InteractionEnum metric, Date startTime, Date endTime) {
        List<Analytics20Min> data = analytics20MinRepository.findByProductIdAndTimeRange(productId, startTime, endTime);

        return data.stream()
                .map(record -> TimeSeriesPointDTO.builder()
                        .timestamp(record.getTimeBucket())
                        .value(record.getCount(metric))
                        .build())
                .collect(Collectors.toList());
    }

    private List<TimeSeriesPointDTO> getTimeSeriesHourly(Long productId, InteractionEnum metric, Date startTime, Date endTime) {
        List<AnalyticsHourly> data = analyticsHourlyRepository.findByProductIdAndTimeRange(productId, startTime, endTime);

        return data.stream()
                .map(record -> TimeSeriesPointDTO.builder()
                        .timestamp(record.getTimeBucket())
                        .value(record.getCount(metric))
                        .build())
                .collect(Collectors.toList());
    }

    private List<TimeSeriesPointDTO> getTimeSeriesDaily(Long productId, InteractionEnum metric, Date startTime, Date endTime) {
        List<AnalyticsDaily> data = analyticsDailyRepository.findByProductIdAndTimeRange(productId, startTime, endTime);

        return data.stream()
                .map(record -> TimeSeriesPointDTO.builder()
                        .timestamp(record.getTimeBucket())
                        .value(record.getCount(metric))
                        .build())
                .collect(Collectors.toList());
    }

    // ===== AGGREGAZIONI =====

    public Map<InteractionEnum, Integer> getTotalMetricsHourly(Long productId, Date startTime, Date endTime) {
        List<AnalyticsHourly> data = analyticsHourlyRepository.findByProductIdAndTimeRange(productId, startTime, endTime);

        for (AnalyticsHourly datum : data) {
            System.out.println("processing hourly datum: " + datum.getProductId() + " at " + datum.getTimeBucket() + " with counts " + datum.getId() + " " + datum.getCounts());
        }
        return aggregateMetrics(data.stream().map(BaseAnalytics::getCounts).collect(Collectors.toList()));
    }

    public Map<InteractionEnum, Integer> getTotalMetricsDaily(Long productId, Date startTime, Date endTime) {
        System.out.println("getting daily metrics for product " + productId + " from " + startTime + " to " + endTime);

        List<AnalyticsDaily> data = analyticsDailyRepository.findByProductIdAndTimeRange(productId, startTime, endTime);
        System.out.println("found " + data.size() + " daily records");

        for (AnalyticsDaily datum : data) {
            System.out.println("processing daily datum: " + datum.getProductId() + " at " + datum.getDate() + " with counts " + datum.getId() + " " + datum.getCounts());
        }
        return aggregateMetrics(data.stream().map(BaseAnalytics::getCounts).collect(Collectors.toList()));
    }

    private Map<InteractionEnum, Integer> aggregateMetrics(List<Map<InteractionEnum, Integer>> dataList) {
        Map<InteractionEnum, Integer> totals = new HashMap<>();

        for (InteractionEnum metric : InteractionEnum.values()) {
            totals.put(metric, 0);
        }

        for (Map<InteractionEnum, Integer> metrics : dataList) {
            metrics.forEach((key, value) ->
                    totals.merge(key, value, Integer::sum)
            );
        }

        return totals;
    }

    // ===== COMPARISONS =====

    public AnalyticsComparisonDTO comparePerformance(Long productId, String period) {
        Date now = new Date();
        Date periodStart = calculateStartTime(now, period);
        Date previousPeriodStart = calculateStartTime(periodStart, period);

        Map<InteractionEnum, Integer> current = getTotalMetricsDaily(productId, periodStart, now);
        Map<InteractionEnum, Integer> previous = getTotalMetricsDaily(productId, previousPeriodStart, periodStart);

        Map<InteractionEnum, Double> growthRates = new HashMap<>();
        for (InteractionEnum metric : InteractionEnum.values()) {
            Integer currentValue = current.getOrDefault(metric, 0);
            Integer previousValue = previous.getOrDefault(metric, 0);

            double growthRate = previousValue == 0 ? 0 :
                    ((double) (currentValue - previousValue) / previousValue) * 100;

            growthRates.put(metric, growthRate);
        }

        return AnalyticsComparisonDTO.builder()
                .productId(productId)
                .currentPeriod(current)
                .previousPeriod(previous)
                .growthRates(growthRates)
                .build();
    }

    // ===== MULTI-PRODUCT =====

    public List<ProductAnalyticsDTO> getMultiProductAnalytics(List<Long> productIds, String period) {
        Date startTime = calculateStartTime(new Date(), period);

        return productIds.stream()
                .map(productId -> {
                    Map<InteractionEnum, Integer> metrics = getTotalMetricsDaily(productId, startTime, new Date());
                    return ProductAnalyticsDTO.builder()
                            .productId(productId)
                            .metrics(metrics)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ===== UTILITY =====

    private Date calculateStartTime(Date endTime, String period) {
        long millis = TimeUtil.millisFromTimeString(period);

        return TimeUtil.getCalendar(endTime.getTime() - millis).getTime();
    }
}
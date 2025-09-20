package me.leoo.springboot.libri.analytics;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.dto.AnalyticsComparisonDTO;
import me.leoo.springboot.libri.analytics.dto.AnalyticsSummaryDTO;
import me.leoo.springboot.libri.analytics.dto.ProductAnalyticsDTO;
import me.leoo.springboot.libri.analytics.dto.TimeSeriesPointDTO;
import me.leoo.springboot.libri.analytics.service.AnalyticsQueryService;
import me.leoo.springboot.libri.analytics.service.AnalyticsWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsWriteService writeService;
    private final AnalyticsQueryService queryService;

    // Record single event
    @PostMapping("/events")
    public ResponseEntity<String> recordEvent(
            @RequestParam Long productId,
            @RequestParam(required = false) Long userId,
            @RequestParam InteractionEnum eventType) {
        System.out.println("Recording event: " + eventType + " for productId: " + productId);
        writeService.recordEvent(productId, userId, eventType, new Date());
        return ResponseEntity.ok("Event recorded");
    }

    // Dashboard overview
    @GetMapping("/products/{productId}/overview")
    public ResponseEntity<AnalyticsSummaryDTO> getDashboardOverview(
            @PathVariable Long productId) {
        return ResponseEntity.ok(queryService.getDashboardOverview(productId));
    }

    // Time series data
    @GetMapping("/products/{productId}/timeseries/{metric}")
    public ResponseEntity<List<TimeSeriesPointDTO>> getTimeSeries(
            @PathVariable Long productId,
            @PathVariable InteractionEnum metric,
            @RequestParam(defaultValue = "7d") String period,
            @RequestParam(defaultValue = "20min") String resolution) {
        
        List<TimeSeriesPointDTO> data = queryService.getTimeSeriesData(productId, metric,
                period, resolution);

        return ResponseEntity.ok(data);
    }

    // Performance comparison
    @GetMapping("/products/{productId}/compare")
    public ResponseEntity<AnalyticsComparisonDTO> comparePerformance(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "7d") String period) {
        
        return ResponseEntity.ok(queryService.comparePerformance(productId, period));
    }

    // Multi-product analytics
    @GetMapping("/products/batch")
    public ResponseEntity<List<ProductAnalyticsDTO>> getMultiProductAnalytics(
            @RequestParam List<Long> productIds,
            @RequestParam(defaultValue = "7d") String period) {
        
        return ResponseEntity.ok(queryService.getMultiProductAnalytics(productIds, period));
    }
}
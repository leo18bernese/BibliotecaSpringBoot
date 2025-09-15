package me.leoo.springboot.libri.analytics.dto;

import lombok.Builder;
import lombok.Data;
import me.leoo.springboot.libri.analytics.InteractionEnum;

import java.util.Map;

@Data
@Builder
public class AnalyticsComparisonDTO {
    private Long productId;
    private Map<InteractionEnum, Integer> currentPeriod;
    private Map<InteractionEnum, Integer> previousPeriod;
    private Map<InteractionEnum, Double> growthRates;
}

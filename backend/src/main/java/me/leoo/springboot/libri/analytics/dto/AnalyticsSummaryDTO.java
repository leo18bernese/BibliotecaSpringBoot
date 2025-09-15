package me.leoo.springboot.libri.analytics.dto;

import lombok.Builder;
import lombok.Data;
import me.leoo.springboot.libri.analytics.InteractionEnum;

import java.util.Map;

@Data
@Builder
public class AnalyticsSummaryDTO {
    private Long productId;
    private Map<InteractionEnum, Integer> last24Hours;
    private Map<InteractionEnum, Integer> last7Days;
    private Map<InteractionEnum, Integer> last30Days;
}


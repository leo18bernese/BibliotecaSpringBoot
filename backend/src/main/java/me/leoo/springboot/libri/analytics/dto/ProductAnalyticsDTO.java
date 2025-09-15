package me.leoo.springboot.libri.analytics.dto;

import lombok.Builder;
import lombok.Data;
import me.leoo.springboot.libri.analytics.InteractionEnum;

import java.util.Map;

@Data
@Builder
public class ProductAnalyticsDTO {
    private Long productId;
    private Map<InteractionEnum, Integer> metrics;
}

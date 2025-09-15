package me.leoo.springboot.libri.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class TimeSeriesPointDTO {
    private Date timestamp;
    private Integer value;
}

package me.leoo.springboot.libri.analytics.history;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.data.annotation.Id;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class EventLog {

    @Id
    private String id;

    private Long productId;
    private InteractionEnum eventType;
    private Long timestamp;
    private String info = "";

    public EventLog(Long productId, InteractionEnum eventType, String info) {
        this.productId = productId;
        this.eventType = eventType;
        this.timestamp = Instant.now().toEpochMilli();
        this.info = info;
    }

    public boolean isRecent() {
        return (Instant.now().toEpochMilli() - this.timestamp) <= eventType.getDelay();
    }
}

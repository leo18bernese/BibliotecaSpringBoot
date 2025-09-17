package me.leoo.springboot.libri.analytics.history;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventLogRepository repository;

    public boolean hasEventOccurred(InteractionEnum eventType, Long productId, String customInfo) {
        Optional<EventLog> eventLog = repository.findByEventTypeAndProductId(eventType, productId);

        if (eventLog.isPresent()) {
            if (eventLog.get().isRecent()) {
                return true;
            } else {

                eventLog.get().setTimestamp(Instant.now().toEpochMilli());
                eventLog.get().setInfo(customInfo);

                repository.save(eventLog.get());

                return false;
            }
        }

        EventLog newEvent = new EventLog(productId, eventType, customInfo);
        repository.save(newEvent);

        return false;
    }

}
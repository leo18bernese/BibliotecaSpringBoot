package me.leoo.springboot.libri.analytics.history;

import me.leoo.springboot.libri.analytics.InteractionEnum;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventLogRepository extends MongoRepository<EventLog, String> {

    Optional<EventLog> findByEventTypeAndProductId(InteractionEnum eventType, Long productId);
}

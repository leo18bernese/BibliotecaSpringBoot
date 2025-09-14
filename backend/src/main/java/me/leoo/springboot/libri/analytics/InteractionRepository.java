package me.leoo.springboot.libri.analytics;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InteractionRepository extends MongoRepository<UserProductInteraction, String> {

    Optional<UserProductInteraction> findByProductIdAndUserId(Long productId, Long userId);

    Iterable<UserProductInteraction> getAllByProductId(Long productId);
}
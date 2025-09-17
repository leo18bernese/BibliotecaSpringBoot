package me.leoo.springboot.libri.analytics;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum InteractionEnum {
    IMPRESSION(30L * 1000), // 30 seconds
    VIEW(2 * 60L * 1000), // 30 seconds
    ADD_TO_CART(5 * 60L * 1000), // 5 minutes
    ADD_TO_WISHLIST(5 * 60L * 1000), // 5 minutes
    VIEW_IMAGE(60L * 1000); // 1 minute

    private final Long delay;
}

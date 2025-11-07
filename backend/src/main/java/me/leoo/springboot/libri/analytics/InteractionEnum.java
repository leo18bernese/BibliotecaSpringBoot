package me.leoo.springboot.libri.analytics;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum InteractionEnum {

    // Generic
    IMPRESSION(30L * 1000), // 30 seconds
    VIEW(2 * 60L * 1000), // 2 minutes

    // Catalog
    VIEW_CATEGORY(60L * 1000), // 1 minute
    SEARCH(30L * 1000), // 30 seconds
    APPLY_FILTER(30L * 1000), // 30 seconds
    VIEW_IMAGE(60L * 1000), // 1 minute

    // Cart & Wishlist
    ADD_TO_CART(5 * 60L * 1000), // 5 minutes
    REMOVE_FROM_CART(30L * 1000), // 30 seconds
    ADD_TO_WISHLIST(5 * 60L * 1000), // 5 minutes
    REMOVE_FROM_WISHLIST(30L * 1000), // 30 seconds

    // Checkout
    START_CHECKOUT(3 * 60L * 1000), // 3 minutes
    COMPLETE_PURCHASE(10 * 60L * 1000), // 10 minutes

    // Reviews
    WRITE_REVIEW(4 * 60L * 1000), // 4 minutes
    VIEW_REVIEWS(2 * 60L * 1000), // 2 minutes

    // User
    LOGIN(60L * 1000), // 1 minute
    REGISTER(3 * 60L * 1000), // 3 minutes
    VIEW_ORDERS(2 * 60L * 1000); // 2 minutes

    private final Long delay;
}

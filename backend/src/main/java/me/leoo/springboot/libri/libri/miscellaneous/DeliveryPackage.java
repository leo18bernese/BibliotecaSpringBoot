package me.leoo.springboot.libri.libri.miscellaneous;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RequiredArgsConstructor
@Getter
public enum DeliveryPackage {

    SMALL("Piccolo", 30, 20, 10, 2.0),
    MEDIUM("Medio", 50, 40, 30, 5.0),
    LARGE("Grande", 100, 80, 60, 10.0),
    EXTRA_LARGE("Extra Grande", 150, 120, 100, 20.0);

    private final String displayName;

    private final double maxLength;
    private final double maxWidth;
    private final double maxHeight;
    private final double maxWeight;

    @JsonValue
    public Map<String, Object> toMap() {
        return Map.of(
                "name", name(),
                "displayName", displayName,
                "maxLength", maxLength,
                "maxWidth", maxWidth,
                "maxHeight", maxHeight,
                "maxWeight", maxWeight
        );
    }

    public static DeliveryPackage getMostSuitable(double length, double width, double height, double weight) {
        for (DeliveryPackage pack : values()) {
            if (length <= pack.maxLength && width <= pack.maxWidth && height <= pack.maxHeight && weight <= pack.maxWeight) {
                return pack;
            }
        }

        return null; // No suitable package found
    }
}

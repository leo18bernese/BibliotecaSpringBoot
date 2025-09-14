package me.leoo.springboot.libri.analytics;

import java.util.Date;

public record InteractionEvent(InteractionEnum type, Date timestamp) {
}

package me.leoo.springboot.libri.libri.descrizione;

import jakarta.persistence.Embeddable;

@Embeddable
public record LibroDimension(double length, double width, double height,
                             double weight) {

    public LibroDimension() {
        this(0.0, 0.0, 0.0, 0.0);
    }
}
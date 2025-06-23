package me.leoo.springboot.libri.utils;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LibriUtils {

    public static final String DANGER = "#B22222";
    public static final String WARNING = "#FF8C00";
    public static final String SUCCESS = "#228B22";

    public double round(double price) {
        return (double) Math.round(price * 100) / 100;
    }
}

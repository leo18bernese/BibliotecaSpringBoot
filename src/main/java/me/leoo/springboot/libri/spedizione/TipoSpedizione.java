package me.leoo.springboot.libri.spedizione;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

public record TipoSpedizione(Tipo tipo, int costo, int giorniMinimo, int giorniMassimo) {

    public String getNome() {
        return tipo.getNome();
    }

    @RequiredArgsConstructor
    @Getter
    public enum Tipo {
        STANDARD("Standard"),
        EXPRESS("Express"),
        PRIORITY("Priority");

        private final String nome;
    }
}

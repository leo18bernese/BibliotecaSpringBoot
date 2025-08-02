package me.leoo.springboot.libri.libri.search;

import java.util.Map;

public record FiltroOpzione(String valore,
                            Long conteggio,
                            boolean selezionato,
                            Map<String, Object> metadata) {
}


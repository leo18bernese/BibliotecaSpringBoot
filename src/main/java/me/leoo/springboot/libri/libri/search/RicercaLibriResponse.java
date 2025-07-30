package me.leoo.springboot.libri.libri.search;

import me.leoo.springboot.libri.libri.Libro;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public record RicercaLibriResponse(Page<Libro> libri, Map<String, List<FiltroOpzione>> filtriDisponibili,
                                   Map<String, List<String>> filtriMultipli) {
}
package me.leoo.springboot.libri.libri.search;

import me.leoo.springboot.libri.libri.LibroController;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public record RicercaLibriResponse(Page<LibroController.LiteBookResponse> libri,
                                   Map<String, List<FiltroOpzione>> filtriDisponibili,
                                   Map<String, List<String>> filtriMultipli) {
}
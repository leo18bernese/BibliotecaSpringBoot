package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/admin/libri")
@RequiredArgsConstructor
public class AdminBookController {

    private final LibroRepository libroRepository;

    public record BookResponse(Long id, String name, String author, String isbn,
                               int variants) {
    }

    @GetMapping("/light-all")
    public Set<BookResponse> getAllLightBooks(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Libro> libros = libroRepository.findAll(pageable);

        return libros.stream()
                .map(l -> new BookResponse(
                        l.getId(),
                        l.getTitolo(),
                        l.getAutore().getNome(),
                        l.getIsbn(),
                        l.getVarianti().size()
                ))
                .collect(java.util.stream.Collectors.toSet());
    }
}

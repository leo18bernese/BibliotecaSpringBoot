package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.category.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/category")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    public record CategoryResponse(Long id, String name, String description, boolean hasParent) {

    }

    @GetMapping("/light-all")
    public ResponseEntity<Page<CategoryResponse>> getAllLightCategories(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Category> libros = categoryRepository.findAll(pageable);

            Page<CategoryResponse> bookResponses = libros.map(l -> new CategoryResponse(
                    l.getId(),
                    l.getName(),
                    l.getDescription(),
                    l.getParent() != null
            ));

            return ResponseEntity.ok(bookResponses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

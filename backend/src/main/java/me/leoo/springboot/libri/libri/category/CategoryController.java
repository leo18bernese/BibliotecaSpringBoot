package me.leoo.springboot.libri.libri.category;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final LibroRepository libroRepository;

    public record CategoryResponse(Long id, String name) {
    }

    public record CategoryResponseFirstLevel(Long id, String name, String descrizione, List<CategoryResponse> subcategories) {
    }

    private List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        return categories.stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/homepage")
    public List<Long> getTopCategories(@RequestParam(defaultValue = "5") int limit) {
        List<Category> topCategories = categoryService.getTopCategories(limit);

        return topCategories.stream()
                .map(Category::getId)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryService.getCategoryById(id);

            if (category == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }



    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoryResponse>> getSubcategories(@PathVariable Long id) {
        try {
            List<Category> subcategories = categoryService.getSubcategories(id);

            if (subcategories == null || subcategories.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<CategoryResponse> subcategoryIds = subcategories.stream()
                    .map(subcategory -> new CategoryResponse(subcategory.getId(), subcategory.getName()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(subcategoryIds);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/roots")
    public ResponseEntity<List<CategoryResponseFirstLevel>> getRootCategories() {
        try {
            List<Category> roots = categoryService.getRootCategories();

            if (roots == null || roots.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<CategoryResponseFirstLevel> response = roots.stream()
                    .map(root -> new CategoryResponseFirstLevel(
                            root.getId(),
                            root.getName(),
                            root.getDescription(),
                            toCategoryResponseList(categoryService.getSubcategories(root.getId()))
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{categoryId}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long categoryId) {
        try {
            return categoryService.getPictureResponse(categoryId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<Libro>> getCategoryItems(@PathVariable Long id) {
        try {
            Category category = categoryService.getCategoryById(id);
            if (category == null) {
                return ResponseEntity.notFound().build();
            }

            Pageable pageable = PageRequest.of(0, 20);
            List<Libro> libri = libroRepository.findLibriByCategoriaId(id, pageable);
            return ResponseEntity.ok(libri);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.category.CategoryRepository;
import me.leoo.springboot.libri.libri.category.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/category")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    public record CategoryResponse(Long id, String name, String description, boolean hasParent) {

    }

    public record UpdateCategoryRequest(String name, String description, Long parentId) {
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

    @PatchMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody UpdateCategoryRequest request) {
        try {
            Category category = categoryRepository.findById(id).orElse(null);

            if (category == null) {
                return ResponseEntity.notFound().build();
            }

            Category parent = request.parentId() != null ? categoryService.getCategoryById(request.parentId()) : null;

            category.updateFrom(request, parent);

            return ResponseEntity.ok(categoryRepository.save(category));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

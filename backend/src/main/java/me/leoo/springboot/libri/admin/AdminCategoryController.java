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

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/admin/category")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    public record NameResponse(Long id, String name, Long parentId) {
    }

    public record CategoryResponse(Long id, String name, String description, Long parentId, Date updatedAt){
    }

    public record UpdateCategoryRequest(String name, String description, Long parentId) {
    }

    @GetMapping("/all-names")
    public ResponseEntity<List<NameResponse>> getAllCategoryNames(){
        try {
            List<Category> categories = categoryRepository.findAll();

            List<NameResponse> nameResponses = categories.stream()
                    .map(c -> new NameResponse(c.getId(), c.getName(), c.getParent() != null ? c.getParent().getId() : null))
                    .toList();

            return ResponseEntity.ok(nameResponses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
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
                    l.getParent() != null ? l.getParent().getId() : null,
                    l.getLastUpdateDate()
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

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody UpdateCategoryRequest request) {
        System.out.println("Creating category with name: " + request.name());
        try {
            Category parent = request.parentId() != null ? categoryService.getCategoryById(request.parentId()) : null;

            System.out.println("Parent category: " + (parent != null ? parent.getName() : "null"));
            Category category = new Category();
            category.updateFrom(request, parent);
            System.out.println("Created category: " + category.getName());
            return ResponseEntity.ok(categoryRepository.save(category));
        } catch (Exception e) {
            System.out.println("Error creating category: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            if (!categoryService.exists(id)) {
                return ResponseEntity.notFound().build();
            }

            categoryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

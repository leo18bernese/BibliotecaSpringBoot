package me.leoo.springboot.libri.image;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.LibroService;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.category.CategoryRepository;
import me.leoo.springboot.libri.libri.category.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final LibroRepository libroRepository;
    private final CategoryRepository categoryRepository;
    private final ImageService imageService;
    private final LibroService libroService;
    private final CategoryService categoryService;

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
    @PostMapping("/{productId}")
    public ResponseEntity<String> uploadImages(@PathVariable Long productId,
                                               @RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body("No files provided");
        }

        try {
            int uploadedCount = imageService.saveImage(productId, imageService.getCommonImagesPath(productId), files);

            return ResponseEntity.ok("Successfully uploaded " + uploadedCount + " images");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Cannot upload images");
        }
    }

    @PostMapping("/{productId}/imageUrl")
    public ResponseEntity<String> uploadImages(@PathVariable Long productId,
                                               @RequestParam("imageUrl") String imageUrl) {
        System.out.println("Uploading image from URL: " + imageUrl);

        try {
            imageService.saveImageFromUrl(productId, imageService.getCategoriesImagesPath(productId), imageUrl);
            return ResponseEntity.ok("Image uploaded successfully from URL");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Cannot upload image from URL");
        }
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getImage(@PathVariable Long productId) {
        Optional<Libro> optionalLibro = libroRepository.findById(productId);
        if (optionalLibro.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            List<Path> paths = libroService.getBookAllImages(productId);

            if (paths.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(paths.size());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/{productId}/first")
    public ResponseEntity<byte[]> getFirstImage(@PathVariable Long productId) {
        try {
            return libroService.getPictureResponse(productId, 0);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{productId}/index/{index}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId, @PathVariable int index) {
        try {
            return libroService.getPictureResponse(productId, index);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{productId}/index/{index}")
    public ResponseEntity<String> deleteImage(@PathVariable Long productId, @PathVariable int index) {
        List<Path> paths = libroService.getBookAllImages(productId);

        if (paths.isEmpty()) {
            return ResponseEntity.badRequest().body("No images to delete");
        }

        if (index < 0 || index >= paths.size()) {
            return ResponseEntity.badRequest().body("Invalid image index");
        }

        Path path = paths.get(index);

        try {
            Files.deleteIfExists(path);
            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting image");
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getCategoryImage(@PathVariable Long categoryId) {
        Optional<Category> optionalCategory = categoryRepository.findById(categoryId);
        if (optionalCategory.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            List<Path> paths = categoryService.getCategoryAllImages(categoryId);

            if (paths.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(paths.size());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/category/{categoryId}/index/{index}")
    public ResponseEntity<byte[]> getCategoryImage(@PathVariable Long categoryId, @PathVariable int index) {
        try {
            return categoryService.getPictureResponse(categoryId, index, false);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/category/{categoryId}/index/{index}")
    public ResponseEntity<String> deleteCategoryImage(@PathVariable Long categoryId, @PathVariable int index) {
        List<Path> paths = categoryService.getCategoryAllImages(categoryId);

        if (paths.isEmpty()) {
            return ResponseEntity.badRequest().body("No images to delete");
        }
        if (index < 0 || index >= paths.size()) {
            return ResponseEntity.badRequest().body("Invalid image index");
        }
        Path path = paths.get(index);

        try {
            Files.deleteIfExists(path);
            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting image");
        }
    }

    @PostMapping("/category/{categoryId}/imageUrl")
    public ResponseEntity<String> uploadCategoryImage(@PathVariable Long categoryId,
                                                      @RequestParam("imageUrl") String imageUrl) {
        try {
            imageService.saveImageFromUrl(categoryId, imageService.getCategoriesImagesPath(categoryId), imageUrl);
            return ResponseEntity.ok("Category image uploaded successfully from URL");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Cannot upload category image from URL");
        }
    }

}

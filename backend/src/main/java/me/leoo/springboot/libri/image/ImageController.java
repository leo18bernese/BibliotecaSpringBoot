package me.leoo.springboot.libri.image;

import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    private LibroRepository libroRepository;

    @Deprecated
    private static final String UPLOAD_DIR = "backend/src/main/resources/static/images";

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
    @PostMapping("/{productId}")
    public ResponseEntity<String> uploadImage(@PathVariable Long productId,
                                              @RequestParam("file") MultipartFile file) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;

            Path dirPath = Paths.get(finalPath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            Path path = Paths.get(finalPath, file.getOriginalFilename());
            Files.write(path, file.getBytes());

            return ResponseEntity.ok("Image uploaded successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Cannot upload image");
        }
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getImage(@PathVariable Long productId) {
        Optional<Libro> optionalLibro = libroRepository.findById(productId);
        if (optionalLibro.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Libro libro = optionalLibro.get();

        try {
            List<Path> paths = libro.getAllImages();

            if (paths.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(paths.size());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/{productId}/first")
    public ResponseEntity<byte[]> getFirstImage(@PathVariable Long productId) {
        Libro libro = libroRepository.findById(productId).orElseThrow();

        return libro.getPictureResponse(0);
    }

    @GetMapping("/{productId}/index/{index}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId, @PathVariable int index) {
        Libro libro = libroRepository.findById(productId).orElseThrow();

        try {
            return libro.getPictureResponse(index);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteImage(@PathVariable Long productId) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;

            Path path = Paths.get(finalPath);
            Files.delete(path);

            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<byte[]> getImageResponse(byte[] image, String fileName) {
        String contentType = determineContentType(fileName);

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(image);
    }

    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            default -> "application/octet-stream"; // Default
        };
    }
}

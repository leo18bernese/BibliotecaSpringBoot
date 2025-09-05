package me.leoo.springboot.libri.image;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.LibroService;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final LibroRepository libroRepository;
    private final ImageService imageService;
    private final LibroService libroService;

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
    @PostMapping("/{productId}")
    public ResponseEntity<String> uploadImages(@PathVariable Long productId,
                                               @RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body("No files provided");
        }

        try {
            String finalPath = imageService.getCommonImagesPath(productId);

            Path dirPath = Paths.get(finalPath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            int uploadedCount = 0;

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    Path path = Paths.get(finalPath, file.getOriginalFilename());
                    Files.write(path, file.getBytes());
                    uploadedCount++;
                }
            }

            return ResponseEntity.ok("Successfully uploaded " + uploadedCount + " images");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Cannot upload images");
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

package me.leoo.springboot.libri.image;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    ResourceLoader resourceLoader;

    private static final String UPLOAD_DIR = "src/main/resources/static/images";

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
    @PostMapping("/{productId}")
    public ResponseEntity<String> uploadImage(@PathVariable Long productId,
                                              @RequestParam("file") MultipartFile file) {
        System.out.println("ImageController: uploadImage called " + productId + " " + file.getOriginalFilename());

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
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return ResponseEntity.notFound().build();
            }

            // Ottieni la lista di file nella directory
            List<String> fileNames = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .map(path -> path.getFileName().toString())
                    .toList();

            return ResponseEntity.ok(fileNames);
        } catch (AccessDeniedException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/{productId}/first")
    public ResponseEntity<byte[]> getFirstImage(@PathVariable Long productId) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return ResponseEntity.notFound().build();
            }

            List<File> files = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .toList();

            if (files.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            File firstFile = files.get(0);
            byte[] image = Files.readAllBytes(firstFile.toPath());

            return getImageResponse(image, firstFile.getName());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{productId}/name/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId, @PathVariable String fileName) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId + "/" + fileName;
            Path filePath = Paths.get(finalPath);

            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] image = Files.readAllBytes(filePath);

            return getImageResponse(image, fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{productId}/index/{index}")
    public ResponseEntity<byte[]> getImageByIndex(@PathVariable Long productId, @PathVariable int index) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return ResponseEntity.notFound().build();
            }

            List<File> files = Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .toList();

            if (index < 0 || index >= files.size()) {
                return ResponseEntity.notFound().build();
            }

            File file = files.get(index);

            byte[] image = Files.readAllBytes(file.toPath());

            return getImageResponse(image, file.getName());
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

package me.leoo.springboot.libri.image;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

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
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId) {
        try {
            String finalPath = UPLOAD_DIR + "/" + productId;

            Path path = Paths.get(finalPath);
            byte[] image = Files.readAllBytes(path);

            return ResponseEntity.ok(image);
        }  catch (java.nio.file.AccessDeniedException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.noContent().build();
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
}

package me.leoo.springboot.libri.libri.images;

import lombok.experimental.UtilityClass;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@UtilityClass
public class ImageUtils {

    public ResponseEntity<byte[]> getImageResponse(Path path) throws IOException {
        return getImageResponse(Files.readAllBytes(path), path.getFileName().toString());
    }

    public ResponseEntity<byte[]> getImageResponse(byte[] image, String fileName) {
        String contentType = determineContentType(fileName);

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(image);
    }

    public String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            default -> "application/octet-stream"; // Default
        };
    }
}

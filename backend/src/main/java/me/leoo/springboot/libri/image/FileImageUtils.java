package me.leoo.springboot.libri.image;

import lombok.experimental.UtilityClass;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import org.springframework.http.ResponseEntity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@UtilityClass
public class FileImageUtils {

    public List<Path> getAllImages(Long id, String path) {
        try {
            Path dirPath = Paths.get(path);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return List.of();
            }

            return Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Error while getting all images for: " + id, e);
        }
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id, String generalPath, String fallbackPath, int index) {
        List<Path> paths = getAllImages(id, generalPath);
        Path path;

        if (paths.isEmpty()) {

            if(fallbackPath != null && !fallbackPath.isEmpty()) {
                path = Paths.get(fallbackPath);
            } else {
                return ResponseEntity.notFound().build();
            }

        } else {
            if (index < 0 || index >= paths.size()) {
                return ResponseEntity.notFound().build();
            }

            path = paths.get(index);
        }

        System.out.println("Serving image: " + path);
        try {
            return ImageUtils.getImageResponse(path);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

package me.leoo.springboot.libri.libri;

import me.leoo.springboot.libri.image.ImageService;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import me.leoo.springboot.libri.utils.LibriUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class LibroService {

    @Autowired
    private ImageService imageService;

    public List<Path> getBookAllImages(Long id){
        try {
            String finalPath = imageService.getCommonImagesPath(id);
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return List.of();
            }

            return Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Error while getting all images for book with ID: " + id, e);
        }
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id, int index) {
        List<Path> paths = getBookAllImages(id);

        if (paths.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        if (index < 0 || index >= paths.size()) {
            return ResponseEntity.notFound().build();
        }

        Path path = paths.get(index);

        try {
            return ImageUtils.getImageResponse(path);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

package me.leoo.springboot.libri.resi.chat;

import me.leoo.springboot.libri.image.ImageService;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class MessaggioService {

    @Autowired
    private ImageService imageService;

    /**
     * Structure: order dir -> attachment_messageId_index.extension
     * <p>
     * attachment_4_1.jpg for for the first attachment of the fourth message
     */
    public List<Path> getMessageAllImages(Long resoId){

        try {
            String finalPath = imageService.getOrdersImagesPath(resoId);
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return List.of();
            }

            return Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().startsWith("attachment_" + resoId + "_"))
                    .toList();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error while getting all images for book with ID: " + resoId, e);
        }
    }

    public ResponseEntity<byte[]> getPictureResponse(Long resoid, int index) {
        List<Path> paths = getMessageAllImages(resoid);

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

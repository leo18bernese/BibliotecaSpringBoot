package me.leoo.springboot.libri.libri;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.image.FileImageUtils;
import me.leoo.springboot.libri.image.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final ImageService imageService;

    public List<Path> getBookAllImages(Long id) {
        return FileImageUtils.getAllImages(id, imageService.getCommonImagesPath(id));
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id, int index) {
        return FileImageUtils.getPictureResponse(id, imageService.getCommonImagesPath(id), imageService.getNotFoundPath(), index);
    }
}

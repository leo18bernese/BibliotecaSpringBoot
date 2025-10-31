package me.leoo.springboot.libri.image;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ImageService {

    private final ImageProperties imageProperties;

    @Autowired
    public ImageService(ImageProperties imageProperties) {
        this.imageProperties = imageProperties;
    }

    public String getNotFoundPath() {
        return imageProperties.getCommonDir() + "/nf.png";
    }

    public String getCommonImagesPath(Object fileName) {
        return imageProperties.getCommonDir() + "/" + fileName.toString();
    }

    public String getOrdersImagesPath(Object fileName) {
        return imageProperties.getOrdersDir() + "/" + fileName.toString();
    }

    public String getCategoriesImagesPath(Object fileName) {
        return imageProperties.getCategoriesDir() + "/" + fileName.toString();
    }

    public int saveImage(Long productId, String finalPath, MultipartFile[] files) {
        //String finalPath = getCommonImagesPath(productId);
        int uploadedCount = 0;

        try {
            Path dirPath = Paths.get(finalPath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            long existingFilesCount;
            try (var stream = Files.list(dirPath)) {
                existingFilesCount = stream.count();
            }

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String originalFilename = file.getOriginalFilename();
                    String extension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }
                    String newFilename = (existingFilesCount + uploadedCount + 1) + extension;

                    Path path = Paths.get(finalPath, newFilename);
                    Files.write(path, file.getBytes());
                    uploadedCount++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return uploadedCount;
    }

    public void saveImageFromUrl(Long productId, String finalPath,String imageUrl) {
        //String finalPath = getCommonImagesPath(productId);

        //todo fix request for image here because now returns 403 sometimes

        try (InputStream in = new URL(imageUrl).openStream()) {
            Path dirPath = Paths.get(finalPath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            long existingFilesCount;
            try (var stream = Files.list(dirPath)) {
                existingFilesCount = stream.count();
            }

            String originalFilename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                int queryParamIndex = extension.indexOf('?');
                if (queryParamIndex != -1) {
                    extension = extension.substring(0, queryParamIndex);
                }
            }
            String newFilename = (existingFilesCount + 1) + extension;

            Path filePath = dirPath.resolve(newFilename);
            Files.copy(in, filePath, StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
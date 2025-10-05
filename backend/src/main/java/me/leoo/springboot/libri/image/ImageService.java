package me.leoo.springboot.libri.image;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImageService {

    private final ImageProperties imageProperties;

    @Autowired
    public ImageService(ImageProperties imageProperties) {
        this.imageProperties = imageProperties;
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

    // Qui puoi aggiungere altri metodi come saveImage(), deleteImage(), ecc.
}
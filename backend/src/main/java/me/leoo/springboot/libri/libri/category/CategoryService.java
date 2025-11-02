package me.leoo.springboot.libri.libri.category;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.image.FileImageUtils;
import me.leoo.springboot.libri.image.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ImageService imageService;

    public List<Category> getTopCategories(int limit) {
        List<Category> categories = categoryRepository.findTop10ByOrderByPurchasedCountDesc();

        System.out.println(categories.stream().map(Category::getName).collect(Collectors.toList()));
        System.out.println(categories.stream().limit(limit).map(Category::getName).collect(Collectors.toList()));

        return categories.stream().limit(limit).collect(Collectors.toList());
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public Long getPreviousCategory(Long id) {
        return categoryRepository.findPreviousCategory(id);
    }

    public Long getNextCategory(Long id) {
        return categoryRepository.findNextCategory(id);
    }

    public List<Category> getSubcategories(Long id) {
        return categoryRepository.findSubcategories(id);
    }

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentIsNull();
    }

    public boolean exists(Long id) {
        return categoryRepository.existsById(id);
    }


    // images
    public List<Path> getCategoryAllImages(Long id) {
        return FileImageUtils.getAllImages(id, imageService.getCategoriesImagesPath(id));
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id, boolean nullIfNotFound) {
        return getPictureResponse(id, 0, nullIfNotFound);
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id, int index, boolean nullIfNotFound) {
        return FileImageUtils.getPictureResponse(id, imageService.getCategoriesImagesPath(id),
                nullIfNotFound ? null : imageService.getNotFoundPath(),
                index);
    }
}

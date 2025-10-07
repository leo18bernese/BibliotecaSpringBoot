package me.leoo.springboot.libri.libri.category;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.image.FileImageUtils;
import me.leoo.springboot.libri.image.ImageProperties;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.swing.plaf.PanelUI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ImageProperties imageProperties;

    public List<Category> getTopCategories(int limit) {
        List<Category> categories = categoryRepository.findTop10ByOrderByPurchasedCountDesc();

        System.out.println(categories.stream().map(Category::getName).collect(Collectors.toList()));
        System.out.println(categories.stream().limit(limit).map(Category::getName).collect(Collectors.toList()));

        return categories.stream().limit(limit).collect(Collectors.toList());
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public List<Category> getSubcategories(Long id) {
        return categoryRepository.findSubcategories(id);
    }

    public ResponseEntity<byte[]> getPictureResponse(Long id) {
      return FileImageUtils.getPictureResponse(id, imageProperties.getCategoriesDir() + "/" + id, 0);
    }
}

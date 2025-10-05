package me.leoo.springboot.libri.libri.category;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.swing.plaf.PanelUI;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getTopCategories(int limit) {
        List<Category> categories = categoryRepository.findTop10ByOrderByPurchasedCountDesc();

        System.out.println(categories.stream().map(Category::getName).collect(Collectors.toList()));
        System.out.println(categories.stream().limit(limit).map(Category::getName).collect(Collectors.toList()));

        return categories.stream().limit(limit).collect(Collectors.toList());
    }

    public Category getCategoryById(int id) {
        return categoryRepository.findById((long) id).orElse(null);
    }
}

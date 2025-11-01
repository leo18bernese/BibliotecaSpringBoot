package me.leoo.springboot.libri.libri.category;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.admin.AdminCategoryController;
import org.hibernate.annotations.Parent;

import java.util.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description = "";

    private Date creationDate = new Date();
    private Date lastUpdateDate = new Date();

    private boolean hidden = false;

    //parent
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    private Category parent;

    private int purchasedCount = 0;
    private int viewCount = 0;
    private int wishlistCount = 0;

    public Category(String name) {
        this.name = name;
    }

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Category(String name, Category parent) {
        this.name = name;
        this.parent = parent;
    }

    public Category(String name, String description, Category parent) {
        this.name = name;
        this.description = description;
        this.parent = parent;
    }

    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    public String getParentName() {
        return parent != null ? parent.getName() : null;
    }

    public void incrementPurchased() {
        this.purchasedCount++;
    }

    public void incrementView() {
        this.viewCount++;
    }

    public void incrementWishlist() {
        this.wishlistCount++;
    }

    public Map<Long, String> getCategoryMap() {
        List<Category> categories = new ArrayList<>();

        Category c = this;

        while (c != null) {
            categories.add(c);
            c = c.getParent();
        }

        Collections.reverse(categories);

        Map<Long, String> map = new LinkedHashMap<>();
        categories.forEach(cat -> map.put(cat.getId(), cat.getName()));

        return map;
    }

    public Category updateFrom(AdminCategoryController.UpdateCategoryRequest request, Category parent) {
        this.setName(request.name());
        this.setDescription(request.description());

        this.setLastUpdateDate(new Date());

        this.setParent(parent);

        return this;
    }
}

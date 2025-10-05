package me.leoo.springboot.libri.libri.category;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public void incrementPurchased() {
        this.purchasedCount++;
    }

    public void incrementView() {
        this.viewCount++;
    }

    public void incrementWishlist() {
        this.wishlistCount++;
    }
}

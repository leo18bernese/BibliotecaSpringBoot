package me.leoo.springboot.libri.libri.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name);

    List<Category> findTop10ByOrderByPurchasedCountDesc();


    // find subcategories of a category
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId")
    List<Category> findSubcategories(@Param("parentId") Long parentId);

}

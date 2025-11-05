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

    List<Category> findByParentIsNull();

    List<Category> findByParent_Id(Long parentId);

    // find the previous category id (with the highest id less than the given id)
    @Query("SELECT c.id FROM Category c WHERE c.id < :id ORDER BY c.id DESC LIMIT 1")
    Long findPreviousCategory(@Param("id") Long id);

    @Query("SELECT c.id FROM Category c WHERE c.id > :id ORDER BY c.id ASC LIMIT 1")
    Long findNextCategory(@Param("id") Long id);
}





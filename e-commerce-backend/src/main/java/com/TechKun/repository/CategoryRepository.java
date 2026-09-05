package com.TechKun.repository;

import com.TechKun.dao.CategoryRepositoryExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Category;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer>, CategoryRepositoryExtension {
    @Query(value = """
            WITH RECURSIVE subcategories AS (
                SELECT category_id FROM category WHERE parent_id = :categoryId
                UNION ALL
                SELECT c.category_id
                FROM category c
                INNER JOIN subcategories s ON c.parent_id = s.category_id
            )
            SELECT category_id FROM subcategories
            """, nativeQuery = true)
    List<Integer> getSubcategoryIds(@Param("categoryId") Integer categoryId);

    @Query(value = "SELECT COUNT(*) FROM category WHERE parent_id = :categoryId", nativeQuery = true)
    long countByParentCategoryId(@Param("categoryId") Integer categoryId);

    @Query("SELECT c FROM Category c WHERE c.parentCategory IS NULL")
    List<Category> findParentCategories();

}

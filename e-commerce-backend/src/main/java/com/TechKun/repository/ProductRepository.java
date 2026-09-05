package com.TechKun.repository;

import com.TechKun.dao.ProductRepositoryExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Product;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer>, ProductRepositoryExtension {
    @Query("SELECT COUNT(*) FROM Product p WHERE p.code = :code")
    long countByProductCode(@Param("code") String code);

    @Modifying
    @Query(value = "UPDATE product SET " +
        "title = CASE WHEN :title IS NOT NULL THEN :title ELSE title END, " +
        "starred = CASE WHEN :starred IS NOT NULL THEN :starred ELSE starred END, " +
        "status = CASE WHEN :status IS NOT NULL THEN :status ELSE status END, " +
        "category_id = CASE WHEN :categoryId IS NOT NULL THEN :categoryId ELSE category_id END " +
        "WHERE product_id = :productId", nativeQuery = true)
    void updateTitleStarredStatusOrCategory(Integer productId, String title, Boolean starred, Boolean status, Integer categoryId);

    @Query(value = "SELECT COUNT(*) FROM product WHERE category_id = :categoryId", nativeQuery = true)
    long countProductsByCategoryId(@Param("categoryId") Integer categoryId);

    @Modifying
    @Query(value = "UPDATE product SET status = :status WHERE product_id IN (:ids)", nativeQuery = true)
    void bulkUpdateStatus(@Param("status") boolean status, @Param("ids") List<Integer> ids);
}

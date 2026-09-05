package com.TechKun.repository;

import com.TechKun.dao.PromotionRepositoryExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Promotion;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Integer>, PromotionRepositoryExtension {
    @Modifying
    @Query(value = "DELETE FROM promotion_category WHERE category_id IN :categoryIds", nativeQuery = true)
    void removePromotionCategoriesByCategoryId(@Param("categoryIds") List<Integer> categoryId);

    @Query(value = """
    SELECT COUNT(*) 
    FROM order_item oi
    JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
    JOIN product p ON pv.product_id = p.product_id
    JOIN category c ON p.category_id = c.category_id
    JOIN promotion_category pc ON c.category_id = pc.category_id
    WHERE pc.promotion_id = :promotionId
""", nativeQuery = true)
    long countOrdersUsingPromotion(@Param("promotionId") Integer promotionId);


}

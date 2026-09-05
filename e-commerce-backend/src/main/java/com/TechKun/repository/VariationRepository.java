package com.TechKun.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.TechKun.model.Variation;
import org.springframework.data.repository.query.Param;

public interface VariationRepository extends JpaRepository<Variation, Integer> {
    @Query("""
        SELECT v FROM Variation v
        WHERE :categoryId IS NULL
           OR EXISTS (
               SELECT 1 FROM Category c
               JOIN c.variations cv
               WHERE c.categoryId = :categoryId AND v = cv
           )""")
    List<Variation> findVariationsByCategoryId(@Param("categoryId") Integer categoryId);
    @Query(value = """
        SELECT COUNT(*) 
        FROM order_item oi
        JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
        JOIN product_variant_property pvp ON pv.product_variant_id = pvp.product_variant_id
        JOIN variation_option vo ON pvp.variation_option_id = vo.variation_option_id
        WHERE vo.variation_id = :variationId
    """, nativeQuery = true)
    long countOrdersUsingVariation(@Param("variationId") Integer variationId);

}

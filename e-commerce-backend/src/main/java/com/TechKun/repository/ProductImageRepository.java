package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.ProductImage;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    @Modifying
    @Query(
        "UPDATE ProductImage pi " +
        "SET pi.isDefault = CASE WHEN pi.productImageId = :productImageId THEN true ELSE false END " +
        "WHERE pi.product.productId = :productId"
    )
    int makeDefault(
        @Param("productId") Integer productId,
        @Param("productImageId") Integer productImgeId
    );
}

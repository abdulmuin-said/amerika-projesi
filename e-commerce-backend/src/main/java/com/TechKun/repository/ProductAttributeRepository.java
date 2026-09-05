package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.ProductAttribute;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Integer> {
    @Modifying
    @Query("UPDATE ProductAttribute pa SET pa.value = null WHERE pa.attribute.attributeId = :attributeId")
    void resetAllAttributesByAttributeId(@Param("attributeId") Integer attributeId);

    void deleteByAttribute_AttributeId(Integer attributeId);

    @Query(value = """
    SELECT COUNT(*) 
    FROM order_item oi
    JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
    JOIN product p ON pv.product_id = p.product_id
    JOIN product_attribute pa ON p.product_id = pa.product_id
    WHERE pa.attribute_id = :attributeId
""", nativeQuery = true)
    long countOrdersUsingAttribute(@Param("attributeId") Integer attributeId);

}

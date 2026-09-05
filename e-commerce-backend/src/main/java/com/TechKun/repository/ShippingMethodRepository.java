package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.ShippingMethod;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Integer>, JpaSpecificationExecutor<ShippingMethod> {
          @Query("SELECT pv.product.shippingMethod FROM ProductVariant pv WHERE pv.productVariantId = :variantId")
          ShippingMethod findByProductVariantId(@Param("variantId") Integer variantId);
}

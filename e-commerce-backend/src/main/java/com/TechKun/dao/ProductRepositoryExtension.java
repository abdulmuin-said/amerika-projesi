package com.TechKun.dao;

import java.util.List;
import java.util.Optional;

import com.TechKun.dto.product_dtos.ProductDetails;
import com.TechKun.dto.product_dtos.ProductPreview;
import com.TechKun.dto.product_dtos.ProductQueryOptions;

public interface ProductRepositoryExtension {
    List<ProductPreview> getProductPreviews(ProductQueryOptions filters);

    List<ProductPreview> getFeaturedProductPreviews();

    List<ProductPreview> getLatestProductPreviews();

    Optional<ProductDetails> getProductDetails(Integer productId);
}

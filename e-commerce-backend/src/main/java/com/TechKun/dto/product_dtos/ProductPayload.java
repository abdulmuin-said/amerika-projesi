package com.TechKun.dto.product_dtos;

import java.util.List;

import lombok.Data;

@Data
public class ProductPayload {
    private String title;
    private String code;
    private String description;
    private Boolean starred;
    private Boolean status;
    private Integer categoryId;
    private Integer shippingMethodId;
    private List<ProductImage> images;
    private List<ProductVariant> variants;
    private List<ProductAttribute> attributes;

    @Data
    public static class ProductImage {
        private Integer productImageId;
        private String imageUrl;
        private Boolean isDefault;
    }

    @Data
    public static class ProductVariant {
        private Integer productVariantId;
        private String sku;
        private Integer quantityInStock;
        private Double price;
        private Boolean disabled;
        private List<Integer> variationOptionIds;
    }

    @Data
    public static class ProductAttribute {
        private Integer attributeId;
        private String value;
    }
}

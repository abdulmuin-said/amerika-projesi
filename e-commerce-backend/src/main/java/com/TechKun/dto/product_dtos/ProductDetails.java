package com.TechKun.dto.product_dtos;

import java.util.List;
import java.util.Map;

import com.TechKun.model.ProductImage;

import lombok.Data;

@Data
public class ProductDetails {
    private Integer productId;
    private List<ProductImage> images;
    private String title;
    private String code;
    private Boolean starred;
    private Boolean status;
    private Integer categoryId;
    private Integer shippingMethodId;
    private List<ProductVariant> variants;
    private String description;
    private List<ProductAttributeItem> attributes;
    private Double averageRating;
    private Integer reviewCount;

    @Data
    public static class ProductVariant {
        private Integer productVariantId;
        private String sku;
        private double price;
        private Boolean disabled;
        private int quantityInStock;
        private Map<Integer, VariantProperty> variantProperties;
    }

    @Data
    public static class VariantProperty {
        private Integer variationOptionId;
        private String name;
    }

    @Data
    public static class ProductAttributeItem {
        private Integer productAttributeId;
        private AttributeItem attribute;
        private String value;
    }

    @Data
    public static class AttributeItem {
        private Integer attributeId;
        private String name;
        private String type;
    }
}
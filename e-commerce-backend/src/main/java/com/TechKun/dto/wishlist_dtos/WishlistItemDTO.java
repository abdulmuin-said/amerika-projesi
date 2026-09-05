package com.TechKun.dto.wishlist_dtos;

import lombok.Data;

@Data
public class WishlistItemDTO {
    private Integer wishlistItemId;
    private String productTitle;
    private String productImageUrl;
    private ProductVariantDTO productVariant;

    @Data
    public static class ProductVariantDTO {
        private Integer productVariantId;
        private String sku;
        private int quantityInStock;
        private double price;
    }
}

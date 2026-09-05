package com.TechKun.dto.cart_dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.TechKun.model.Personalization;

import lombok.Data;

@Data
public class CartItemPreview {
    private Integer cartItemId;
    private LocalDateTime addedAt;
    private String imageUrl;
    private String title;
    private Integer productVariantId;
    private String sku;
    private Integer quantityInStock;
    private Double price;           // final price (after discount if any)
    private Double originalPrice;   // base price before discount; null when no promotion applies
    private String promotionType;   // "PERCENTAGE" or "FLAT"; null when no promotion
    private Double discountValue;   // e.g. 20.0 for 20% off; null when no promotion
    private Integer quantity;
    private Personalization personalization;
    private List<VariationOptionInfo> variationOptions;

    @Data
    public static class VariationOptionInfo {
        private Integer variationOptionId;
        private String optionName;    // e.g. "50x70cm"
        private String variationName; // e.g. "Size"
    }
}

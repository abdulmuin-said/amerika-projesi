package com.TechKun.dto.cart_dtos;

import com.TechKun.model.Personalization;
import lombok.Data;

@Data
public class CartItemDTO {
    private Integer productImageId;
    private Integer productVariantId;
    private Integer quantity;
    private Personalization personalization;
}
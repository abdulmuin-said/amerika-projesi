package com.TechKun.dto.cart_dtos;

import com.TechKun.model.Personalization;
import lombok.Data;

@Data
public class CartItemUpdatePayload {
    private Integer quantity;
    private Personalization personalization;
}
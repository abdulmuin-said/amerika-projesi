package com.TechKun.dto.order_dtos;

import com.TechKun.model.Personalization;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Integer orderItemId;
    private Integer productVariantId;
    private Integer shippingMethodId;
    private Personalization personalization;
    private Integer quantity;
    private Double price;
}

package com.TechKun.dto.stripe_dtos;

import com.TechKun.dto.AddressDTO;
import lombok.Data;

import java.util.List;

@Data
public class CreatePaymentIntentRequest {

    private List<OrderItemPayload> items;
    private Integer shippingAddressId;
    private AddressDTO shippingAddress;
    private Double subtotalAmount;
    private Double shippingAmount;
    private Double taxAmount;
    private Double discountAmount;
    private Double totalAmount;

    @Data
    public static class OrderItemPayload {
        private Integer productVariantId;
        private Integer shippingMethodId;
        private Double price;
        private Integer quantity;
        private String productName;
        private String categoryName;
    }
}

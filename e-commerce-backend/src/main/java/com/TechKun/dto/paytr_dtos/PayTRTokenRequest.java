package com.TechKun.dto.paytr_dtos;

import com.TechKun.dto.AddressDTO;
import lombok.Data;

import java.util.List;

@Data
public class PayTRTokenRequest {

    private List<OrderItemPayload> items;
    private Integer shippingAddressId;
    private AddressDTO shippingAddress;
    private Double subtotalAmount;
    private Double shippingAmount;
    private Double taxAmount;
    private Double discountAmount;
    private Double totalAmount;
    private String currency; // "TRY" / "TL" or "USD"
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userIp;

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

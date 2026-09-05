package com.TechKun.dto.order_dtos;

import lombok.Data;

import java.util.List;

import com.TechKun.dto.AddressDTO;

@Data
public class OrderCreatePayload {
    private List<OrderItemDTO> items;
    private Integer shippingAddressId;
    private AddressDTO shippingAddress;
    private Integer paymentMethodId;

    private Double subtotalAmount;
    private Double shippingAmount;
    private Double taxAmount;
    private Double discountAmount;
    private Double totalAmount;
}
package com.TechKun.dto.order_dtos;

import com.TechKun.model.enums.OrderStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

import com.TechKun.dto.AddressDTO;

@Data
public class OrderUpdatePayload {
    private LocalDate estimatedDeliveryDate;
    private String trackingNumber;
    private OrderStatus status;
    private Integer shippingAddressId;
    private AddressDTO shippingAddress;
    private List<OrderItemDTO> items;
    private Integer paymentMethodId;
    private String paymentProvider;
    private Integer shippingMethodId;
    private String shippingProvider;
}
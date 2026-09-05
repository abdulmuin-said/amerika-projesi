package com.TechKun.dto.order_dtos;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.TechKun.dto.CustomerContact;
import com.TechKun.model.*;
import com.TechKun.model.enums.OrderStatus;

@Data
public class OrderDetails {
    private Integer shopOrderId;
    private CustomerContact customer;
    private LocalDateTime orderDate;
    private LocalDate estimatedDeliveryDate;
    private List<OrderItem> orderItems;
    private ShippingMethod shippingMethod;
    private Address shippingAddress;
    private String shippingProvider;
    private PaymentMethod paymentMethod;
    private String paymentProvider;
    private String carrierName;
    private String trackingNumber;
    private OrderStatus orderStatus;
}
package com.TechKun.dto.order_dtos;

import lombok.Data;

import com.TechKun.dto.CustomerContact;
import com.TechKun.model.*;
import com.TechKun.model.enums.OrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrderPreviewDTO {
    private Integer orderId;
    private LocalDateTime orderDate;
    private CustomerContact customer;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private Double totalPrice;
}

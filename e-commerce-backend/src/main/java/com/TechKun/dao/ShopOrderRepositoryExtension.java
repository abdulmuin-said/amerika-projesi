package com.TechKun.dao;

import org.springframework.data.domain.Page;

import com.TechKun.dto.order_dtos.OrderDetails;
import com.TechKun.dto.order_dtos.OrderPreviewDTO;
import com.TechKun.dto.order_dtos.OrderQueryOptions;

import java.util.Optional;

public interface ShopOrderRepositoryExtension {
    Page<OrderPreviewDTO> getAllOrders(
        Integer customerId, OrderQueryOptions filters,
        Integer page, Integer size
    );

    Optional<OrderDetails> getOrderDetails(Integer orderId);
}
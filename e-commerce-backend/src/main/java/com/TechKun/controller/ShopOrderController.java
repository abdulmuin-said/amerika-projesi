package com.TechKun.controller;

import com.TechKun.dto.order_dtos.*;
import com.TechKun.model.ShopOrder;

import com.TechKun.model.ShopUser;
import com.TechKun.service.ShopOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shop-orders")
public class ShopOrderController {
    @Autowired
    private ShopOrderService shopOrderService;

    @GetMapping
    public ResponseEntity<Page<OrderPreviewDTO>> getAllOrders(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestParam(required = false) Integer customerId,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "10") Integer size,
        @RequestBody(required = false) OrderQueryOptions filters
    ) {
        return ResponseEntity.ok(this.shopOrderService.getAllOrders(
            loggedInUser, customerId, filters, page, size
        ));
    }

    @GetMapping("/{shopOrderId}")
    public ResponseEntity<OrderDetails> getOrderById(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @PathVariable Integer shopOrderId
    ) {
        return ResponseEntity.ok(this.shopOrderService.getOrderById(
            loggedInUser, shopOrderId
        ));
    }

    @PostMapping
    public ResponseEntity<ShopOrder> createOrder(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestBody OrderCreatePayload payload
    ) {
        return ResponseEntity.ok(this.shopOrderService.createOrder(
            loggedInUser, payload
        ));
    }

    @PutMapping("/{shopOrderId}")
    public ResponseEntity<ShopOrder> updateOrder(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @PathVariable Integer shopOrderId,
        @RequestBody OrderUpdatePayload payload
    ) {
        return ResponseEntity.ok(this.shopOrderService.updateOrder(
            loggedInUser, shopOrderId, payload
        ));
    }

}
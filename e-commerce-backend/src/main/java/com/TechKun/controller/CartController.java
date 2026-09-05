package com.TechKun.controller;

import com.TechKun.dto.cart_dtos.*;
import com.TechKun.model.ShopUser;
import com.TechKun.service.CartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart-items")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemPreview>> getAllCartItems(
        @AuthenticationPrincipal ShopUser loggedInUser
    ) {
        return ResponseEntity.ok(this.cartService.getAllCartItems(loggedInUser));
    }

    @PostMapping
    public ResponseEntity<Void> addCartItem(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestBody CartItemDTO addCartItemRequestDTO
    ) {
        this.cartService.addCartItem(loggedInUser, addCartItemRequestDTO);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemPreview> updateCartItem(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @PathVariable Integer cartItemId,
        @RequestBody CartItemUpdatePayload payload
    ) {
        return ResponseEntity.ok(this.cartService.updateCartItem(loggedInUser, cartItemId, payload));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @PathVariable Integer cartItemId
    ) {
        this.cartService.deleteCartItem(loggedInUser, cartItemId);
        return ResponseEntity.noContent().build();
    }
}     
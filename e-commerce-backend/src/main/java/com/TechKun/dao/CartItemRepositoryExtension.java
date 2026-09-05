package com.TechKun.dao;

import java.util.List;
import java.util.Optional;

import com.TechKun.dto.cart_dtos.CartItemPreview;
import com.TechKun.model.CartItem;

public interface CartItemRepositoryExtension {
    List<CartItemPreview> getCartItemPreviews(Integer userId);
    Optional<CartItem> getCartItemLite(Integer cartItemId);
}
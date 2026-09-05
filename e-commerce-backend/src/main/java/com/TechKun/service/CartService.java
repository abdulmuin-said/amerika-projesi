package com.TechKun.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.TechKun.model.ProductImage;
import com.TechKun.model.ProductVariant;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.TechKun.dto.cart_dtos.*;
import com.TechKun.model.CartItem;
import org.springframework.util.Assert;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;

    public List<CartItemPreview> getAllCartItems(ShopUser loggedInUser) {
        return this.cartItemRepository.getCartItemPreviews(loggedInUser.getUserId());
    }

    public void addCartItem(ShopUser loggedInUser, CartItemDTO cartItemDTO) {
        Assert.notNull(cartItemDTO.getProductVariantId(), "Product variant ID must not be null.");
        Assert.isTrue(
                cartItemDTO.getQuantity() != null && cartItemDTO.getQuantity() > 0,
                "Quantity must be greater than zero.");

        CartItem cartItem = new CartItem();
        cartItem.setAddedAt(LocalDateTime.now());
        cartItem.setCustomer(loggedInUser);
        if (cartItemDTO.getProductImageId() != null) {
            cartItem.setProductImage(new ProductImage(cartItemDTO.getProductImageId()));
        } else {
            cartItem.setProductImage(null);
        }
        cartItem.setProductVariant(new ProductVariant(cartItemDTO.getProductVariantId()));
        cartItem.setQuantity(cartItemDTO.getQuantity());
        cartItem.setPersonalization(cartItemDTO.getPersonalization());

        this.cartItemRepository.save(cartItem);
    }

    public CartItemPreview updateCartItem(
            ShopUser loggedInUser,
            Integer cartItemId,
            CartItemUpdatePayload payload) {
        if (payload.getQuantity() == null && payload.getPersonalization() == null)
            throw new IllegalStateException("At least one field must be provided for update.");

        CartItem cartItem = this.cartItemRepository.getCartItemLite(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found."));
        if (!Objects.equals(loggedInUser.getUserId(), cartItem.getCustomer().getUserId()))
            throw new AccessDeniedException("You are not authorized to update this cart item.");

        if (payload.getQuantity() != null)
            cartItem.setQuantity(payload.getQuantity());
        if (payload.getPersonalization() != null)
            cartItem.setPersonalization(payload.getPersonalization());

        this.cartItemRepository.save(cartItem);

        CartItemPreview preview = new CartItemPreview();
        preview.setCartItemId(cartItem.getCartItemId());
        preview.setQuantity(cartItem.getQuantity());
        preview.setPersonalization(cartItem.getPersonalization());
        return preview;
    }

    public void deleteCartItem(ShopUser loggedInUser, Integer cartItemId) {
        CartItem cartItem = this.cartItemRepository.getCartItemLite(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found."));
        if (!Objects.equals(loggedInUser.getUserId(), cartItem.getCustomer().getUserId()))
            throw new AccessDeniedException("You are not authorized to delete this cart item.");

        this.cartItemRepository.deleteById(cartItemId);
    }

    @Scheduled(fixedRate = 60000)
    public void removeExpiredItems() {
        LocalDateTime expirationTime = LocalDateTime.now().minusDays(1); // 24 hours expiration
        List<CartItem> expiredItems = this.cartItemRepository.findByAddedAtBefore(expirationTime);
        this.cartItemRepository.deleteAll(expiredItems);
    }
}

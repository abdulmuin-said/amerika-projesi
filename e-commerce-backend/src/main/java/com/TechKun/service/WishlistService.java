package com.TechKun.service;

import java.util.List;

import com.TechKun.model.ProductVariant;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.TechKun.model.WishlistItem;
import com.TechKun.dto.wishlist_dtos.WishlistItemDTO;
import org.springframework.util.Assert;

@Service
public class WishlistService {
    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    public List<WishlistItemDTO> getWishlistItems(ShopUser loggedInUser) {
        return this.wishlistItemRepository.getWishlistItems(loggedInUser.getUserId());
    }
    public WishlistItem addToWishlist(ShopUser loggedInUser, Integer productVariantId) {
        Assert.notNull(productVariantId, "Product variant ID must not be null.");

        WishlistItem wishlistItem = new WishlistItem();
        wishlistItem.setCustomer(loggedInUser);
        ProductVariant productVariant = new ProductVariant(productVariantId);
        wishlistItem.setProductVariant(productVariant);

        return this.wishlistItemRepository.save(wishlistItem);
    }
    public void deleteWishlistItem(ShopUser loggedInUser, Integer wishlistItemId) {
        Integer userId = this.wishlistItemRepository.getUserIdForWishlistItem(wishlistItemId);
        if (!(loggedInUser.getUserId().equals(userId) || loggedInUser.isAdmin()))
            throw new AccessDeniedException("You are not authorized to delete this wishlist item.");

        this.wishlistItemRepository.deleteById(wishlistItemId);
    }
}

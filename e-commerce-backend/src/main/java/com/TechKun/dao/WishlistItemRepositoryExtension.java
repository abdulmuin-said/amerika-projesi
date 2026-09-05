package com.TechKun.dao;

import com.TechKun.dto.wishlist_dtos.WishlistItemDTO;

import java.util.List;

public interface WishlistItemRepositoryExtension {
    List<WishlistItemDTO> getWishlistItems(Integer userId);

    Integer getUserIdForWishlistItem(Integer wishlistItemId);
}
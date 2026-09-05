package com.TechKun.controller;

import com.TechKun.model.ShopUser;
import com.TechKun.model.WishlistItem;
import com.TechKun.dto.wishlist_dtos.WishlistItemDTO;
import com.TechKun.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist-items")
public class WishlistController {
    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDTO>> getWishlistItems(
        @AuthenticationPrincipal ShopUser loggedInUser
    ) {
        return ResponseEntity.ok(this.wishlistService.getWishlistItems(loggedInUser));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> addToWishlist(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestParam Integer productVariantId
    ) {
        return ResponseEntity.ok(this.wishlistService.addToWishlist(loggedInUser, productVariantId));
    }

    @DeleteMapping("/{wishlistItemId}")
    public ResponseEntity<Void> deleteWishlistItem(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @PathVariable Integer wishlistItemId
    ) {
        this.wishlistService.deleteWishlistItem(loggedInUser, wishlistItemId);
        return ResponseEntity.noContent().build();
    }
}

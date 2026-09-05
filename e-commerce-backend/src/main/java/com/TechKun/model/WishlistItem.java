package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "WishlistItem")
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlist_item_id", nullable = false)
    private Integer wishlistItemId;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private ShopUser customer;
}
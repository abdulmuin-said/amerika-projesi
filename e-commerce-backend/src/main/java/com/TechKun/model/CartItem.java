package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "CartItem")
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id", nullable = false)
    private Integer cartItemId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private ShopUser customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id")
    private ProductImage productImage;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "personalization_id")
    private Personalization personalization;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

}

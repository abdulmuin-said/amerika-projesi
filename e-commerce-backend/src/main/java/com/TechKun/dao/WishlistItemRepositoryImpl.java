package com.TechKun.dao;

import com.TechKun.dto.wishlist_dtos.WishlistItemDTO;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class WishlistItemRepositoryImpl implements WishlistItemRepositoryExtension {
    @Autowired
    private EntityManager em;

    @Override
    public List<WishlistItemDTO> getWishlistItems(Integer userId) {
        String nativeQuery = """
            WITH user_wishlist_items AS (
                SELECT *
                FROM wishlist_item wi
                WHERE (CAST(:userId AS INTEGER) IS NULL OR wi.customer_id = CAST(:userId AS INTEGER))
            ),
            wishlist_product_variants AS (
                SELECT
                    w.wishlist_item_id,
                    pv.product_variant_id,
                    pv.sku,
                    pv.price,
                    pv.quantity_in_stock,
                    pv.product_id,
                    p.title AS product_title
                FROM user_wishlist_items w
                JOIN product_variant pv ON w.product_variant_id = pv.product_variant_id
                JOIN product p ON pv.product_id = p.product_id
            ),
            wishlist_product_images AS (
                SELECT DISTINCT ON (pi.product_id)
                    pi.product_id,
                    pi.image_url
                FROM product_image pi
                WHERE pi.is_default = true
                AND pi.product_id IN (
                    SELECT DISTINCT product_id
                    FROM wishlist_product_variants
                )
            )
            SELECT
                w.*,
                pi.image_url
            FROM wishlist_product_variants w
            LEFT JOIN wishlist_product_images pi ON w.product_id = pi.product_id
        """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
            .setParameter("userId", userId)
            .getResultList();
        if (result.isEmpty())
            return List.of();

        return result.stream()
            .map(item -> {
                WishlistItemDTO wishlistItemDTO = new WishlistItemDTO();
                wishlistItemDTO.setWishlistItemId((Integer) item.get("wishlist_item_id"));
                wishlistItemDTO.setProductTitle((String) item.get("product_title"));
                wishlistItemDTO.setProductImageUrl((String) item.get("image_url"));
                WishlistItemDTO.ProductVariantDTO productVariantDTO = new WishlistItemDTO.ProductVariantDTO();
                productVariantDTO.setProductVariantId((Integer) item.get("product_variant_id"));
                productVariantDTO.setSku((String) item.get("sku"));
                productVariantDTO.setPrice((Double) item.get("price"));
                productVariantDTO.setQuantityInStock((Integer) item.get("quantity_in_stock"));
                wishlistItemDTO.setProductVariant(productVariantDTO);
                return wishlistItemDTO;
            })
           .collect(Collectors.toList());
    }

    @Override
    public Integer getUserIdForWishlistItem(Integer wishlistItemId) {
        Assert.notNull(wishlistItemId, "Wishlist item ID cannot be null.");

        String nativeQuery = """
            SELECT customer_id
            FROM wishlist_item
            WHERE wishlist_item_id = :wishlistItemId
        """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
           .setParameter("wishlistItemId", wishlistItemId)
           .getResultList();
        if (result.isEmpty())
            return null;
        return (Integer) result.get(0).get("customer_id");
    }
}
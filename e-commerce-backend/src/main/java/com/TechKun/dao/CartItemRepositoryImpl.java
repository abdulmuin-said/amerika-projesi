package com.TechKun.dao;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import com.TechKun.dto.cart_dtos.CartItemPreview;
import com.TechKun.model.CartItem;
import com.TechKun.model.Personalization;
import com.TechKun.model.ProductImage;
import com.TechKun.model.ProductVariant;
import com.TechKun.model.ShopUser;

import jakarta.persistence.EntityManager;

@Repository
public class CartItemRepositoryImpl implements CartItemRepositoryExtension {
    @Autowired
    private EntityManager em;

    @Override
    public List<CartItemPreview> getCartItemPreviews(Integer userId) {
        Assert.notNull(userId, "User ID must not be null.");
        String nativeQuery = """
            WITH user_cart_items AS (
                SELECT *
                FROM cart_item
                WHERE customer_id = :userId
            )
            SELECT
                ci.cart_item_id,
                ci.quantity,
                ci.added_at,
                ci.product_variant_id,
                p.title AS product_title,
                COALESCE(
                    pi.image_url,
                    (SELECT img.image_url FROM product_image img
                     WHERE img.product_id = p.product_id
                     ORDER BY img.is_default DESC, img.product_image_id ASC
                     LIMIT 1)
                ) AS image_url,
                pv.sku,
                pv.price,
                pv.quantity_in_stock,
                pz.personalization_id,
                pz.personalization_text,
                pz.attached_image_url,
                (SELECT promo.promotion_type
                 FROM promotion_category pc
                 JOIN promotion promo ON pc.promotion_id = promo.promotion_id
                 WHERE pc.category_id = p.category_id
                   AND (promo.valid_from IS NULL OR promo.valid_from <= CURRENT_DATE)
                   AND (promo.valid_till IS NULL OR promo.valid_till >= CURRENT_DATE)
                 ORDER BY promo.discount_value DESC
                 LIMIT 1) AS promo_type,
                (SELECT promo.discount_value
                 FROM promotion_category pc
                 JOIN promotion promo ON pc.promotion_id = promo.promotion_id
                 WHERE pc.category_id = p.category_id
                   AND (promo.valid_from IS NULL OR promo.valid_from <= CURRENT_DATE)
                   AND (promo.valid_till IS NULL OR promo.valid_till >= CURRENT_DATE)
                 ORDER BY promo.discount_value DESC
                 LIMIT 1) AS promo_discount_value
            FROM user_cart_items ci
            JOIN product_variant pv ON ci.product_variant_id = pv.product_variant_id
            JOIN product p ON pv.product_id = p.product_id
            LEFT JOIN product_image pi ON pi.product_image_id = ci.image_id
            LEFT JOIN personalization pz ON ci.personalization_id = pz.personalization_id
        """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
            .setParameter("userId", userId)
            .getResultList();

        if (result.isEmpty())
            return List.of();

        List<CartItemPreview> previews = result.stream()
            .map(item -> {
                CartItemPreview preview = new CartItemPreview();
                preview.setCartItemId((Integer) item.get("cart_item_id"));
                preview.setQuantity((Integer) item.get("quantity"));
                Timestamp ts = (Timestamp) item.get("added_at");
                preview.setAddedAt(ts != null ? ts.toLocalDateTime() : null);
                preview.setImageUrl((String) item.get("image_url"));
                preview.setTitle((String) item.get("product_title"));
                preview.setProductVariantId((Integer) item.get("product_variant_id"));
                preview.setSku((String) item.get("sku"));
                preview.setQuantityInStock((Integer) item.get("quantity_in_stock"));

                Double basePrice = item.get("price") != null
                    ? ((Number) item.get("price")).doubleValue() : 0.0;
                String promoType = (String) item.get("promo_type");
                Double promoDiscount = item.get("promo_discount_value") != null
                    ? ((Number) item.get("promo_discount_value")).doubleValue() : null;

                if (promoType != null && promoDiscount != null) {
                    preview.setOriginalPrice(basePrice);
                    preview.setPromotionType(promoType);
                    preview.setDiscountValue(promoDiscount);
                    double discounted = "PERCENTAGE".equals(promoType)
                        ? basePrice * (1.0 - promoDiscount / 100.0)
                        : Math.max(0.0, basePrice - promoDiscount);
                    preview.setPrice(discounted);
                } else {
                    preview.setPrice(basePrice);
                    preview.setOriginalPrice(null);
                }

                Integer personalizationId = (Integer) item.get("personalization_id");
                if (personalizationId != null) {
                    Personalization personalization = new Personalization(personalizationId);
                    personalization.setPersonalizationText((String) item.get("personalization_text"));
                    personalization.setAttachedImageUrl((String) item.get("attached_image_url"));
                    preview.setPersonalization(personalization);
                }

                preview.setVariationOptions(new ArrayList<>());
                return preview;
            })
            .collect(Collectors.toList());

        // Batch-fetch variation options for all variants
        List<Integer> variantIds = previews.stream()
            .map(CartItemPreview::getProductVariantId)
            .collect(Collectors.toList());

        if (!variantIds.isEmpty()) {
            String voQuery = """
                SELECT pvp.product_variant_id, vo.variation_option_id,
                       vo.name AS option_name, v.name AS variation_name
                FROM product_variant_property pvp
                JOIN variation_option vo ON pvp.variation_option_id = vo.variation_option_id
                JOIN variation v ON vo.variation_id = v.variation_id
                WHERE pvp.product_variant_id IN :variantIds
            """;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> voResult = this.em.createNativeQuery(voQuery, Map.class)
                .setParameter("variantIds", variantIds)
                .getResultList();

            Map<Integer, List<CartItemPreview.VariationOptionInfo>> voMap = voResult.stream()
                .collect(Collectors.groupingBy(
                    row -> (Integer) row.get("product_variant_id"),
                    Collectors.mapping(row -> {
                        CartItemPreview.VariationOptionInfo info = new CartItemPreview.VariationOptionInfo();
                        info.setVariationOptionId((Integer) row.get("variation_option_id"));
                        info.setOptionName((String) row.get("option_name"));
                        info.setVariationName((String) row.get("variation_name"));
                        return info;
                    }, Collectors.toList())
                ));

            previews.forEach(p ->
                p.setVariationOptions(voMap.getOrDefault(p.getProductVariantId(), List.of()))
            );
        }

        return previews;
    }

    @Override
    public Optional<CartItem> getCartItemLite(Integer cartItemId) {
        Assert.notNull(cartItemId, "Cart item ID cannot be null.");
        String nativeQuery = """
            SELECT *
            FROM cart_item
            WHERE cart_item_id = :cartItemId
        """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
                .setParameter("cartItemId", cartItemId)
                .getResultList();
        if (result.isEmpty())
            return Optional.empty();
        Map<String, Object> ci = result.get(0);
        CartItem cartItem = new CartItem();
        cartItem.setCartItemId((Integer) ci.get("cart_item_id"));
        cartItem.setProductVariant(new ProductVariant((Integer) ci.get("product_variant_id")));
        cartItem.setQuantity((Integer) ci.get("quantity"));
        Timestamp ts = (Timestamp) ci.get("added_at");
        cartItem.setAddedAt(ts != null ? ts.toLocalDateTime() : null);
        cartItem.setCustomer(new ShopUser((Integer) ci.get("customer_id")));
        Integer personalizationId = (Integer) ci.get("personalization_id");
        if (personalizationId != null)
            cartItem.setPersonalization(new Personalization(personalizationId));
        Integer productImageId = (Integer) ci.get("image_id");
        if (productImageId != null)
            cartItem.setProductImage(new ProductImage(productImageId));

        return Optional.of(cartItem);
    }
}

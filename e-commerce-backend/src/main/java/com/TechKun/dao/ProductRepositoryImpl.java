package com.TechKun.dao;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.TechKun.dto.product_dtos.ProductDetails;
import com.TechKun.dto.product_dtos.ProductPreview;
import com.TechKun.dto.product_dtos.ProductQueryOptions;
import com.TechKun.model.ProductImage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;

import io.swagger.v3.core.util.Json;
import jakarta.persistence.EntityManager;

@Repository
public class ProductRepositoryImpl implements ProductRepositoryExtension {
    @Autowired
    private EntityManager em;

    private static final String COMMON_CTES = """
            variants_per_product AS (
                SELECT DISTINCT ON (pv.product_id) *
                FROM product_variant pv
                WHERE pv.product_id IN (SELECT product_id FROM filtered_products)
                AND pv.disabled = false
                ORDER BY pv.product_id, pv.price ASC
            ),
            default_images AS (
                SELECT DISTINCT ON (i.product_id)
                    product_id, image_url
                FROM product_image i
                WHERE i.product_id IN (SELECT product_id FROM filtered_products)
                AND i.is_default = true
            ),
            all_images AS (
                SELECT i.product_id,
                       jsonb_agg(i.image_url ORDER BY i.is_default DESC, i.product_image_id ASC) AS all_image_urls
                FROM product_image i
                WHERE i.product_id IN (SELECT product_id FROM filtered_products)
                GROUP BY i.product_id
            ),
            reviews_per_product AS (
                SELECT product_id, AVG(rating) AS rating
                FROM review r
                WHERE r.product_id IN (SELECT product_id FROM filtered_products)
                GROUP BY r.product_id
            )
            """;

    private static final String FINAL_SELECT = """
            SELECT
                p.product_id,
                p.category_id,
                p.shipping_method_id,
                pv.product_variant_id,
                p.date_added,
                pv.quantity_in_stock,
                pi.image_url,
                ai.all_image_urls AS images,
                pv.price,
                pv.price_try,
                p.title,
                p.title_tr,
                p.code,
                COALESCE(pr.rating, 0) AS rating,
                p.starred,
                p.status
            FROM filtered_products p
            JOIN variants_per_product pv ON pv.product_id = p.product_id
            LEFT JOIN default_images pi ON pi.product_id = p.product_id
            LEFT JOIN all_images ai ON ai.product_id = p.product_id
            LEFT JOIN reviews_per_product pr ON pr.product_id = p.product_id
            """;

    private String buildQuery(String baseFilter) {
        return "WITH filtered_products AS (" + baseFilter + "), " + COMMON_CTES + FINAL_SELECT;
    }

    @SuppressWarnings("unchecked")
    private List<ProductPreview> executeProductPreviewQuery(String nativeQuery, Map<String, Object> params) {
        var query = this.em.createNativeQuery(nativeQuery, Map.class);
        if (params != null) {
            params.forEach(query::setParameter);
        }
        List<Map<String, Object>> results = (List<Map<String, Object>>) query.getResultList();
        return results.stream()
                .map(this::mapToProductPreview)
                .collect(Collectors.toList());
    }

    private ProductPreview mapToProductPreview(Map<String, Object> result) {
        ProductPreview preview = new ProductPreview();
        preview.setProductId((Integer) result.get("product_id"));
        preview.setCategoryId((Integer) result.get("category_id"));
        preview.setProductVariantId((Integer) result.get("product_variant_id"));
        preview.setDateAdded(((java.sql.Timestamp) result.get("date_added")).toLocalDateTime());
        preview.setQuantityInStock((Integer) result.get("quantity_in_stock"));
        preview.setShippingMethodId((Integer) result.get("shipping_method_id"));
        preview.setImageUrl((String) result.get("image_url"));
        preview.setPrice((Double) result.get("price"));
        preview.setPriceTry(result.get("price_try") != null ? ((Number) result.get("price_try")).doubleValue() : null);
        preview.setTitle((String) result.get("title"));
        preview.setTitleTr((String) result.get("title_tr"));
        preview.setCode((String) result.get("code"));
        preview.setRating((Double) result.get("rating"));
        preview.setStarred((Boolean) result.get("starred"));
        preview.setStatus((Boolean) result.get("status"));
        String imagesJson = (String) result.get("images");
        if (StringUtils.hasText(imagesJson)) {
            try {
                preview.setImages(Json.mapper().readValue(imagesJson, new TypeReference<java.util.List<String>>() {}));
            } catch (IOException e) {
                preview.setImages(new ArrayList<>());
            }
        } else {
            preview.setImages(new ArrayList<>());
        }
        return preview;
    }

    @Override
    public List<ProductPreview> getProductPreviews(ProductQueryOptions filters) {
        String baseFilter = """
            SELECT * FROM product p
            WHERE (CAST(:categoryId AS int) IS NULL OR p.category_id IN (
                WITH RECURSIVE descendant_categories AS (
                  SELECT category_id FROM category WHERE category_id = :categoryId
                  UNION ALL
                  SELECT c.category_id FROM category c
                  JOIN descendant_categories dc ON c.parent_id = dc.category_id
                )
                SELECT category_id FROM descendant_categories
            ))
            AND (CAST(:searchInput AS text) IS NULL OR TRIM(CAST(:searchInput AS text)) = '' OR p.title ILIKE '%' || CAST(:searchInput AS text) || '%' OR (p.title_tr IS NOT NULL AND p.title_tr ILIKE '%' || CAST(:searchInput AS text) || '%'))
            AND (CAST(:status AS boolean) IS NULL OR p.status = CAST(:status AS boolean))
            AND (CAST(:excludeProductId AS int) IS NULL OR p.product_id != CAST(:excludeProductId AS int))
        """;
        String nativeQuery = buildQuery(baseFilter);
        if (filters.getPriceRangeMax() != null || filters.getPriceRangeMin() != null) {
            nativeQuery += """
                WHERE 1 = 1
            """;
            if (filters.getPriceRangeMin() != null)
                nativeQuery += String.format("""
                    AND pv.price >= %d
                """, filters.getPriceRangeMin());
            if (filters.getPriceRangeMax() != null)
                nativeQuery += String.format("""
                    AND pv.price <= %d
                """, filters.getPriceRangeMax());
        }
        if (filters.getSortOption() != null) {
            nativeQuery += switch (filters.getSortOption()) {
                case NEWEST -> """
                    ORDER BY p.date_added DESC
                """;
                case POPULAR -> """
                    ORDER BY rating DESC
                """;
                case PRICE_HIGH_TO_LOW -> """
                    ORDER BY pv.price DESC
                """;
                case PRICE_LOW_TO_HIGH -> """
                    ORDER BY pv.price ASC
                """;
            };
        }
        if (filters.getLimit() != null) {
            nativeQuery += " LIMIT " + filters.getLimit();
        }
        if (filters.getOffset() != null) {
            nativeQuery += " OFFSET " + filters.getOffset();
        }
        Map<String, Object> params = new java.util.HashMap<>();
        params.put("categoryId", filters.getCategoryId());
        params.put("searchInput", Objects.requireNonNullElse(filters.getSearchInput(), ""));
        params.put("status", filters.getStatus());
        params.put("excludeProductId", filters.getExcludeProductId());
        return executeProductPreviewQuery(nativeQuery, params);
    }

    public List<ProductPreview> getFeaturedProductPreviews() {
        String baseFilter = """
                SELECT * FROM product p
                WHERE p.starred = true
                """;
        String nativeQuery = buildQuery(baseFilter);
        return executeProductPreviewQuery(nativeQuery, null);
    }

    public List<ProductPreview> getLatestProductPreviews() {
        String baseFilter = """
                SELECT * FROM product p
                WHERE p.date_added >= NOW() - INTERVAL '1 month'
                ORDER BY p.date_added DESC
                """;
        String nativeQuery = buildQuery(baseFilter);
        return executeProductPreviewQuery(nativeQuery, null);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<ProductDetails> getProductDetails(Integer productId) {
        String nativeQuery = """
                    WITH selected_product AS (
                        SELECT *
                        FROM product p
                        WHERE p.product_id = :productId
                    ),
                    aggregated_images AS (
                        SELECT
                            pi.product_id,
                            jsonb_agg(jsonb_build_object(
                                'productImageId', pi.product_image_id,
                                'imageUrl', pi.image_url,
                                'isDefault', pi.is_default
                            )) AS images
                        FROM product_image pi
                        WHERE pi.product_id = :productId
                        GROUP BY pi.product_id
                    ),
                    filtered_variants AS (
                        SELECT *
                        FROM product_variant pv
                        WHERE pv.product_id = :productId
                    ),
                    aggregated_variant_properties AS (
                        SELECT
                            v.*,
                            jsonb_agg(jsonb_build_object(
                                'variationOptionId', vo.variation_option_id,
                                'name', vo.name,
                                'variationId', vo.variation_id
                            )) AS variant_properties
                        FROM filtered_variants v
                        JOIN product_variant_property pvp ON pvp.product_variant_id = v.product_variant_id
                        JOIN variation_option vo ON vo.variation_option_id = pvp.variation_option_id
                        GROUP BY v.product_variant_id, v.disabled, v.price, v.price_try, v.quantity_in_stock, v.sku, v.product_id
                    ),
                    aggregated_variants AS (
                        SELECT
                            pvp.product_id,
                            jsonb_agg(jsonb_build_object(
                                'productVariantId', pvp.product_variant_id,
                                'sku', pvp.sku,
                                'price', pvp.price,
                                'priceTry', pvp.price_try,
                                'disabled', pvp.disabled,
                                'quantityInStock', pvp.quantity_in_stock,
                                'variantProperties', pvp.variant_properties
                            )) AS variants
                        FROM aggregated_variant_properties pvp
                        GROUP BY pvp.product_id
                    ),
                    aggregated_attributes AS (
                        SELECT
                            pa.product_id,
                            jsonb_agg(jsonb_build_object(
                                'productAttributeId', pa.product_attribute_id,
                                'attribute', jsonb_build_object(
                                    'attributeId', a.attribute_id,
                                    'name', a.name,
                                    'type', a.type
                                ),
                                'value', pa.value
                            )) AS attributes
                        FROM product_attribute pa
                        JOIN attribute a ON a.attribute_id = pa.attribute_id
                        WHERE pa.product_id = :productId
                        GROUP BY pa.product_id
                    ),
                    review_stats AS (
                        SELECT
                            AVG(r.rating) AS avg_rating,
                            COUNT(r.review_id) AS review_count
                        FROM review r
                        WHERE r.product_id = :productId
                    )
                    SELECT p.*, ai.images, av.variants, aa.attributes,
                           rs.avg_rating, rs.review_count
                    FROM selected_product p
                    LEFT JOIN aggregated_images ai ON ai.product_id = p.product_id
                    LEFT JOIN aggregated_variants av ON av.product_id = p.product_id
                    LEFT JOIN aggregated_attributes aa ON aa.product_id = p.product_id
                    LEFT JOIN review_stats rs ON true;
                """;
        List<Map<String, Object>> results = (List<Map<String, Object>>) this.em
                .createNativeQuery(nativeQuery, Map.class)
                .setParameter("productId", productId)
                .getResultList();
        if (results.isEmpty())
            return Optional.empty();

        Map<String, Object> result = results.get(0);
        ProductDetails productDetails = new ProductDetails();
        productDetails.setProductId((Integer) result.get("product_id"));
        productDetails.setTitle((String) result.get("title"));
        productDetails.setTitleTr((String) result.get("title_tr"));
        productDetails.setCode((String) result.get("code"));
        productDetails.setStarred((Boolean) result.get("starred"));
        productDetails.setStatus((Boolean) result.get("status"));
        productDetails.setDescription((String) result.get("description"));
        productDetails.setDescriptionTr((String) result.get("description_tr"));
        productDetails.setCategoryId((Integer) result.get("category_id"));
        productDetails.setShippingMethodId((Integer) result.get("shipping_method_id"));
        productDetails.setAverageRating(result.get("avg_rating") != null ? ((Number) result.get("avg_rating")).doubleValue() : 0.0);
        productDetails.setReviewCount(result.get("review_count") != null ? ((Number) result.get("review_count")).intValue() : 0);
        try {
            String imagesJson = (String) result.get("images");
            List<ProductImage> productImages = !StringUtils.hasText(imagesJson) ? new ArrayList<>()
                    : Json.mapper().readValue(imagesJson, new TypeReference<>() {
                    });
            productDetails.setImages(productImages);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            List<Map<String, Object>> variants = Json.mapper().readValue((String) result.get("variants"), List.class);
            var productVariants = variants.stream()
                    .map(v -> {
                        var productVariant = new ProductDetails.ProductVariant();
                        productVariant.setProductVariantId((Integer) v.get("productVariantId"));
                        productVariant.setSku((String) v.get("sku"));
                        productVariant.setPrice(((Number) v.get("price")).doubleValue());
                        if (v.get("priceTry") != null) {
                            productVariant.setPriceTry(((Number) v.get("priceTry")).doubleValue());
                        }
                        productVariant.setQuantityInStock(((Number) v.get("quantityInStock")).intValue());
                        productVariant.setDisabled((Boolean) v.get("disabled"));
                        List<Map<String, Object>> variantProperties = (List<Map<String, Object>>) v
                                .get("variantProperties");
                        productVariant.setVariantProperties(variantProperties.stream()
                                .map(vp -> {
                                    var variantProperty = new ProductDetails.VariantProperty();
                                    variantProperty.setVariationOptionId((Integer) vp.get("variationOptionId"));
                                    variantProperty.setName((String) vp.get("name"));
                                    return Map.entry(
                                            (Integer) vp.get("variationId"),
                                            variantProperty);
                                })
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
                        return productVariant;
                    })
                    .collect(Collectors.toList());
            productDetails.setVariants(productVariants);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        try {
            String attributesJson = (String) result.get("attributes");
            if (!StringUtils.hasText(attributesJson)) {
                productDetails.setAttributes(new ArrayList<>());
            } else {
                List<Map<String, Object>> attrList = Json.mapper().readValue(attributesJson, List.class);
                List<ProductDetails.ProductAttributeItem> productAttributes = attrList.stream()
                        .map(a -> {
                            var item = new ProductDetails.ProductAttributeItem();
                            item.setProductAttributeId((Integer) a.get("productAttributeId"));
                            item.setValue((String) a.get("value"));
                            Map<String, Object> attrMap = (Map<String, Object>) a.get("attribute");
                            if (attrMap != null) {
                                var attrItem = new ProductDetails.AttributeItem();
                                attrItem.setAttributeId((Integer) attrMap.get("attributeId"));
                                attrItem.setName((String) attrMap.get("name"));
                                attrItem.setType((String) attrMap.get("type"));
                                item.setAttribute(attrItem);
                            }
                            return item;
                        })
                        .collect(Collectors.toList());
                productDetails.setAttributes(productAttributes);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return Optional.of(productDetails);
    }

    // * -- DO NOT REMOVE THIS COMMENT.
    // * -- Old filtered_variants CTE with variationsWhereClause for future use:

    // String variationsWhereClause = filters.getVariations() != null ?
    // filters.getVariations().entrySet()
    // .stream()
    // .map(e -> "(vo.variation_id = " + e.getKey() + " AND vo.variation_option_id =
    // " + e.getValue() + ")")
    // .collect(Collectors.joining(" AND ")): "1 = 1";

    // filtered_variants AS (
    // SELECT *
    // FROM variants_per_product pv
    // JOIN product_variant_property pvp ON pvp.product_variant_id =
    // pv.product_variant_id
    // JOIN variation_option vo ON vo.variation_option_id = pvp.variation_option_id
    // WHERE\s""" + variationsWhereClause + """
    // ),

}

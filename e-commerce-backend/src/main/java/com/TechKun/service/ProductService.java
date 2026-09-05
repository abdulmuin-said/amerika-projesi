package com.TechKun.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.TechKun.helper.UpdateManager;
import com.TechKun.model.*;
import com.TechKun.repository.ProductImageRepository;
import com.TechKun.repository.ProductRepository;
import com.TechKun.repository.ShopOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import com.TechKun.dto.product_dtos.*;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductImageRepository productImageRepository;
    @Autowired
    private ShopOrderRepository shopOrderRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<ProductPreview> getAllProducts(ProductQueryOptions filters) {
        Assert.notNull(filters, "The filters object must not be null.");
        // Assert.notNull(filters.getCategoryId(), "Category ID filter must not be null.");
        return this.productRepository.getProductPreviews(filters);
    }

    public List<ProductPreview> getFeaturedProducts() {
        return this.productRepository.getFeaturedProductPreviews();
    }

    public List<ProductPreview> getLatestProducts() {
        return this.productRepository.getLatestProductPreviews();
    }

    public ProductDetails getProductById(Integer productId) {
        return this.productRepository.getProductDetails(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));
    }

    @Transactional(timeout = 30)
    public Product createProduct(ProductPayload productDto) {
        Assert.hasText(productDto.getTitle(), "Title must not be empty.");
        Assert.hasText(productDto.getCode(), "Code must not be empty.");
        Assert.hasText(productDto.getDescription(), "Description must not be empty.");
        Assert.notNull(productDto.getCategoryId(), "Category ID must not be null.");
        Assert.notNull(productDto.getShippingMethodId(), "Shipping Method ID must not be null.");
        Assert.notEmpty(productDto.getVariants(), "Variants must not be empty.");
        productDto.getVariants().forEach(pv -> {
            Assert.notNull(pv, "A variant must not be null.");
            Assert.hasText(pv.getSku(), "A variant's SKU must not be empty.");
            Assert.notNull(pv.getPrice(), "A variant's price must not be null.");
            Assert.notEmpty(pv.getVariationOptionIds(), "A variant's properties must not be empty.");
            pv.getVariationOptionIds()
                    .forEach(vp -> Assert.notNull(vp, "Variant option ID must not be null."));
        });
        if (productDto.getAttributes() != null)
            productDto.getAttributes()
                    .forEach(a -> {
                        Assert.notNull(a, "An product attribute must not be null.");
                        Assert.notNull(a.getAttributeId(), "A product attribute's attribute ID must not be null.");
                        Assert.hasText(a.getValue(), "A product attribute's value must not be null.");
                    });

        Product product = new Product();
        product.setTitle(productDto.getTitle());
        product.setCode(productDto.getCode());
        product.setDescription(productDto.getDescription());
        product.setDateAdded(LocalDateTime.now());
        product.setStarred(productDto.getStarred() != null ? productDto.getStarred() : false);
        product.setStatus(productDto.getStatus() != null ? productDto.getStatus() : true);
        product.setCategory(new Category(productDto.getCategoryId()));
        product.setShippingMethod(new ShippingMethod(productDto.getShippingMethodId()));
        product.setVariants(new ArrayList<>());
        product.setProductImages(new ArrayList<>());
        if (productDto.getAttributes() != null)
            product.setAttributes(productDto.getAttributes()
                    .stream()
                    .map(a -> {
                        if (a == null)
                            return null;
                        ProductAttribute productAttribute = new ProductAttribute();
                        productAttribute.setProduct(product);
                        productAttribute.setAttribute(new Attribute(a.getAttributeId()));
                        productAttribute.setValue(a.getValue());
                        return productAttribute;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        else
            product.setAttributes(new ArrayList<>());

        try {
            this.productRepository.save(product);
        } catch (DataIntegrityViolationException e) {
            String detail = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
            if (detail != null && detail.contains("sku"))
                throw new IllegalArgumentException("One or more variant SKUs already exist. Check for duplicate SKUs.");
            throw new IllegalArgumentException("A product with this code already exists.");
        }

        bulkInsertVariants(product.getProductId(), productDto.getVariants());
        bulkInsertImages(product.getProductId(), productDto.getImages());
        return product;
    }

    private void bulkInsertImages(Integer productId, List<ProductPayload.ProductImage> images) {
        if (images == null || images.isEmpty()) return;

        StringBuilder imageSql = new StringBuilder(
                "INSERT INTO product_image (product_id, image_url, is_default) VALUES ");
        List<Object> imageParams = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            if (i > 0) imageSql.append(",");
            imageSql.append("(?,?,?)");
            ProductPayload.ProductImage img = images.get(i);
            imageParams.add(productId);
            imageParams.add(img.getImageUrl());
            imageParams.add(img.getIsDefault() != null ? img.getIsDefault() : (i == 0));
        }
        jdbcTemplate.update(imageSql.toString(), imageParams.toArray());
    }

    private void bulkInsertVariants(Integer productId, List<ProductPayload.ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) return;

        // One INSERT for all variants, RETURNING gives us the generated IDs in order.
        StringBuilder variantSql = new StringBuilder(
                "INSERT INTO product_variant (product_id, sku, price, quantity_in_stock, disabled) VALUES ");
        List<Object> variantParams = new ArrayList<>();
        for (int i = 0; i < variants.size(); i++) {
            if (i > 0) variantSql.append(",");
            variantSql.append("(?,?,?,?,?)");
            ProductPayload.ProductVariant v = variants.get(i);
            variantParams.add(productId);
            variantParams.add(v.getSku());
            variantParams.add(v.getPrice());
            variantParams.add(v.getQuantityInStock() != null ? v.getQuantityInStock() : 0);
            variantParams.add(v.getDisabled() != null ? v.getDisabled() : false);
        }
        variantSql.append(" RETURNING product_variant_id");

        List<Integer> variantIds = jdbcTemplate.query(
                variantSql.toString(),
                (rs, rowNum) -> rs.getInt("product_variant_id"),
                variantParams.toArray());

        // One INSERT for all variant-option mappings.
        List<Object> propParams = new ArrayList<>();
        StringBuilder propSql = new StringBuilder(
                "INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES ");
        boolean first = true;
        for (int i = 0; i < variants.size(); i++) {
            List<Integer> optionIds = variants.get(i).getVariationOptionIds();
            if (optionIds == null) continue;
            for (Integer optionId : optionIds) {
                if (!first) propSql.append(",");
                propSql.append("(?,?)");
                propParams.add(variantIds.get(i));
                propParams.add(optionId);
                first = false;
            }
        }
        if (!propParams.isEmpty())
            jdbcTemplate.update(propSql.toString(), propParams.toArray());
    }

    @Transactional(timeout = 30)
    public Product updateProduct(
            Integer productId, ProductPayload productDto) {
        UpdateManager<ProductPayload> updateManager = UpdateManager.ofSource(productDto);
        updateManager.<Integer>updateConfig("categoryId")
                .targetPropertyName("category")
                .mapper(Category::new).add();
        updateManager.<Integer>updateConfig("shippingMethodId")
                .targetPropertyName("shippingMethod")
                .mapper(ShippingMethod::new).add();
        updateManager.removeUpdateConfig("images");
        updateManager.removeUpdateConfig("variants");
        updateManager.removeUpdateConfig("attributes");

        var images = productDto.getImages();
        var variants = productDto.getVariants();
        var attributes = productDto.getAttributes();
        if (updateManager.nothingToUpdate()
                && images == null
                && variants == null
                && attributes == null)
            throw new IllegalStateException("At least one field must be provided for update.");

        if (images != null) {
            images.forEach(img -> {
                Assert.notNull(img, "A product image must not be null.");
            });
        }
        if (variants != null) {
            Assert.notEmpty(variants, "Variants must not be empty.");
            variants.forEach(pv1 -> {
                Assert.notNull(pv1, "A variant must not be null.");
                if (pv1.getVariationOptionIds() != null) {
                    Assert.notEmpty(pv1.getVariationOptionIds(), "A variant's properties must not be empty.");
                    pv1.getVariationOptionIds()
                            .forEach(vp1 -> Assert.notNull(vp1, "Variant option ID must not be null."));
                }
            });
        }
        if (attributes != null)
            attributes.forEach(a -> {
                Assert.notNull(a, "A product attribute must not be null.");
                Assert.notNull(a.getAttributeId(), "A product attribute's attribute ID must not be null.");
                Assert.hasText(a.getValue(), "A product attribute's value must not be null.");
            });

        Product product = this.findProductById(productId);
        updateManager.updateProperties(product);
        if (images != null)
            updateProductImages(productDto, product);
        if (variants != null)
            updateProductVariants(productDto, product);
        if (attributes != null)
            updateProductAttributes(productDto, product);

        return this.productRepository.save(product);
    }

    private static void updateProductImages(ProductPayload productPayload, Product product) {
        Map<Integer, ProductImage> indexedImages = product.getProductImages()
                .stream()
                .collect(Collectors.toMap(
                        ProductImage::getProductImageId,
                        pi -> pi));
        productPayload.getImages()
                .forEach(img -> {
                    ProductImage productImage = indexedImages.remove(img.getProductImageId());
                    if (productImage == null) {
                        product.getProductImages().add(productImage = new ProductImage());
                        productImage.setProduct(product);
                        Assert.hasText(img.getImageUrl(), "An image URL must not be empty.");
                        if (img.getIsDefault() == null)
                            productImage.setIsDefault(false);
                    }
                    if (StringUtils.hasText(img.getImageUrl()))
                        productImage.setImageUrl(img.getImageUrl());
                    if (img.getIsDefault() != null)
                        productImage.setIsDefault(img.getIsDefault());
                });
        indexedImages.values().forEach(product.getProductImages()::remove);
    }

    private static void updateProductAttributes(ProductPayload productDto, Product product) {
        Map<Integer, ProductAttribute> indexedAttributes = product.getAttributes()
                .stream()
                .collect(Collectors.toMap(
                        pa -> pa.getAttribute().getAttributeId(),
                        pa -> pa));
        productDto.getAttributes()
                .forEach(pa -> {
                    ProductAttribute productAttribute = indexedAttributes.remove(pa.getAttributeId());
                    if (productAttribute == null) {
                        product.getAttributes().add(productAttribute = new ProductAttribute());
                        productAttribute.setProduct(product);
                        productAttribute.setAttribute(new Attribute(pa.getAttributeId()));
                    }
                    productAttribute.setValue(pa.getValue());
                });
        indexedAttributes.values().forEach(product.getAttributes()::remove);
    }

    private static void updateProductVariants(ProductPayload productDto, Product product) {
        Map<Integer, ProductVariant> indexedVariants = product.getVariants()
                .stream()
                .collect(Collectors.toMap(
                        ProductVariant::getProductVariantId,
                        variant -> variant));
        var updateManager = UpdateManager.ofSourceType(ProductPayload.ProductVariant.class);
        updateManager.<List<Integer>>updateConfig("variationOptionIds")
                .targetPropertyName("variationOptions")
                .mapper(varOptIds -> varOptIds.stream()
                        .map(VariationOption::new)
                        .collect(Collectors.toList()))
                .add();
        productDto.getVariants()
                .forEach(pv -> {
                    ProductVariant productVariant = indexedVariants.remove(pv.getProductVariantId());
                    if (productVariant == null) {
                        product.getVariants().add(productVariant = new ProductVariant());
                        productVariant.setProduct(product);
                        Assert.hasText(pv.getSku(), "A product variant's SKU must not be empty.");
                        Assert.notNull(pv.getPrice(), "A product variant's price must not be null.");
                        if (pv.getQuantityInStock() == null)
                            pv.setQuantityInStock(0);
                        if (pv.getDisabled() == null)
                            pv.setDisabled(false);
                    }
                    updateManager.setSource(pv);
                    updateManager.updateProperties(productVariant);
                });
        indexedVariants.values().forEach(product.getVariants()::remove);
    }

    @Transactional
    public ProductPatchPayload updateProductBasicDetails(
            Integer productId, ProductPatchPayload payload) {
        String title = payload.getTitle();
        Boolean starred = payload.getStarred();
        Boolean status = payload.getStatus();
        Integer categoryId = payload.getCategoryId();

        if (!StringUtils.hasText(title) && starred == null && status == null && categoryId == null)
            throw new IllegalStateException("At least one field must be provided for update.");

        this.productRepository.updateTitleStarredStatusOrCategory(productId, title, starred, status, categoryId);
        return payload;
    }

    private Product findProductById(Integer productId) {
        return this.productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));
    }

    public ProductImage addProductImage(Integer productId, String imageUrl, Boolean isDefault) {
        Assert.hasText(imageUrl, "Image URL must not be empty.");

        ProductImage productImage = new ProductImage();
        productImage.setImageUrl(imageUrl);
        productImage.setIsDefault(isDefault);
        productImage.setProduct(new Product(productId));

        return this.productImageRepository.save(productImage);
    }

    @Transactional
    public void selectDefaultProductImage(Integer productId, Integer productImageId) {
        var updateOutput = this.productImageRepository.makeDefault(productId, productImageId);
        if (updateOutput == 0)
            throw new RuntimeException("Update failed.");
    }

    public void removeProductImage(Integer productImageId) {
        this.productImageRepository.deleteById(productImageId);
    }

    @Transactional
    public void deleteProduct(Integer productId) {
        long orderCount = this.shopOrderRepository.countOrdersByProductId(productId);
        if (orderCount > 0)
            throw new RuntimeException("Cannot delete product. Orders have been placed for this product.");
        bulkDeleteByIds(List.of(productId));
    }

    @Transactional
    public Map<String, Object> bulkDeleteProducts(List<Integer> productIds) {
        Assert.notEmpty(productIds, "Product IDs must not be empty.");
        String inClause = productIds.stream().map(id -> "?").collect(Collectors.joining(","));
        Object[] idArray = productIds.toArray();

        List<Integer> withOrders = jdbcTemplate.queryForList(
                "SELECT DISTINCT pv.product_id FROM order_item oi " +
                "JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id " +
                "WHERE pv.product_id IN (" + inClause + ")",
                Integer.class, idArray);

        Set<Integer> withOrdersSet = new HashSet<>(withOrders);
        List<Integer> toDelete = productIds.stream()
                .filter(id -> !withOrdersSet.contains(id))
                .collect(Collectors.toList());

        if (!toDelete.isEmpty())
            bulkDeleteByIds(toDelete);

        List<Map<String, Object>> failed = withOrders.stream().map(id -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("productId", id);
            entry.put("reason", "Orders have been placed for this product.");
            return entry;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("deleted", toDelete);
        result.put("failed", failed);
        return result;
    }

    @Transactional
    public void bulkUpdateStatus(List<Integer> productIds, Boolean status) {
        Assert.notEmpty(productIds, "Product IDs must not be empty.");
        Assert.notNull(status, "Status must not be null.");
        this.productRepository.bulkUpdateStatus(status, productIds);
    }

    private void bulkDeleteByIds(List<Integer> ids) {
        String in = ids.stream().map(id -> "?").collect(Collectors.joining(","));
        Object[] arr = ids.toArray();
        jdbcTemplate.update("DELETE FROM product_variant_property WHERE product_variant_id IN (SELECT product_variant_id FROM product_variant WHERE product_id IN (" + in + "))", arr);
        jdbcTemplate.update("DELETE FROM product_variant WHERE product_id IN (" + in + ")", arr);
        jdbcTemplate.update("DELETE FROM product_image WHERE product_id IN (" + in + ")", arr);
        jdbcTemplate.update("DELETE FROM product_attribute WHERE product_id IN (" + in + ")", arr);
        jdbcTemplate.update("DELETE FROM product WHERE product_id IN (" + in + ")", arr);
    }

    // public void deleteProduct(Integer productId)
    // {this.productRepository.deleteById(productId);
    // }

}

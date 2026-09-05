package com.TechKun.controller;

import com.TechKun.dto.product_dtos.*;
import com.TechKun.model.Product;

import com.TechKun.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductPreview>> getAllProducts(@RequestBody ProductQueryOptions filters) {
        return ResponseEntity.ok(this.productService.getAllProducts(filters));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductPreview>> getFeaturedProducts() {
        return ResponseEntity.ok(this.productService.getFeaturedProducts());
    }

    @GetMapping("/latest")
    public ResponseEntity<List<ProductPreview>> getLatestProducts() {
        return ResponseEntity.ok(this.productService.getLatestProducts());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetails> getProductById(@PathVariable Integer productId) {
        return ResponseEntity.ok(this.productService.getProductById(productId));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductPayload productDto) {
        return ResponseEntity.ok(this.productService.createProduct(productDto));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Integer productId,
            @RequestBody ProductPayload productDto) {
        return ResponseEntity.ok(this.productService.updateProduct(productId, productDto));
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<ProductPatchPayload> updateProductBasicDetails(
            @PathVariable Integer productId,
            @RequestBody ProductPatchPayload updateDto) {
        return ResponseEntity.ok(this.productService.updateProductBasicDetails(productId, updateDto));
    }

    @PutMapping("/{productId}/images/{productImageId}")
    public ResponseEntity<Void> selectDefaultProductImage(
            @PathVariable Integer productId,
            @PathVariable Integer productImageId) {
        this.productService.selectDefaultProductImage(productId, productImageId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/images/{productImageId}")
    public ResponseEntity<Void> removeProductImage(
            @PathVariable Integer productImageId) {
        this.productService.removeProductImage(productImageId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer productId) {
        this.productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, Object>> deleteProductsBulk(@RequestBody List<Integer> productIds) {
        return ResponseEntity.ok(this.productService.bulkDeleteProducts(productIds));
    }

    @PatchMapping("/bulk/status")
    public ResponseEntity<Void> bulkUpdateStatus(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> ids = (List<Integer>) body.get("productIds");
        Boolean status = (Boolean) body.get("status");
        this.productService.bulkUpdateStatus(ids, status);
        return ResponseEntity.ok().build();
    }

    // @PostMapping("/{productId}/images")
    // public ResponseEntity<ProductImage> uploadProductImage(
    // @PathVariable Integer productId,
    // @RequestParam("image") MultipartFile imageFile
    // ) {
    // try {
    // String imageUrl =
    // this.googleDriveService.uploadProductImage(imageFile).get("imageUrl");
    // ProductImage productImage = this.productService.addProductImage(productId,
    // imageUrl, false);
    // return ResponseEntity.ok(productImage);
    // } catch (Exception e) {
    // e.printStackTrace();
    // return ResponseEntity.internalServerError().build();
    // }
    // }

}

// The ProductController class handles HTTP requests related to products in the
// e-commerce application.

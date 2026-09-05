package com.TechKun.dto.product_dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductPreview {
    private Integer productId;
    private Integer productVariantId;
    private Integer categoryId;
    private Integer shippingMethodId;
    private LocalDateTime dateAdded;
    private Integer quantityInStock;
    private String imageUrl;
    private List<String> images;
    private double price;
    private String title;
    private String code;
    private double rating;
    private boolean starred;
    private boolean status;
}
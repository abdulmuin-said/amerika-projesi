package com.TechKun.dto.product_dtos;

import lombok.Data;

@Data
public class ProductPatchPayload {
    private String title;
    private Boolean starred;
    private Boolean status;
    private Integer categoryId;
}
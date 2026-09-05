package com.TechKun.dto.product_dtos;

import java.util.Map;

import lombok.Data;

@Data
public class ProductQueryOptions {
    private String searchInput;
    private Integer categoryId;
    private Map<Integer, Integer> variations;
    private SortOption sortOption;
    private Integer priceRangeMin;
    private Integer priceRangeMax;
    private Boolean status;
    private Integer limit;
    private Integer offset;
    private Integer excludeProductId;

    public enum SortOption {
        POPULAR,
        NEWEST,
        PRICE_LOW_TO_HIGH,
        PRICE_HIGH_TO_LOW
    }
}

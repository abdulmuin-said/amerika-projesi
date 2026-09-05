package com.TechKun.dto;

import lombok.Data;

@Data
public class SortOption {
    private String fieldName;
    private SortOrder order;

    public enum SortOrder {
        ASCENDING,
        DESCENDING
    }
}

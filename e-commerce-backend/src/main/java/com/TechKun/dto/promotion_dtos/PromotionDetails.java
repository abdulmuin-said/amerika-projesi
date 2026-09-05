package com.TechKun.dto.promotion_dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

import com.TechKun.model.enums.PromotionType;

@Data
public class PromotionDetails {
    private Integer promotionId;
    private String description;
    private PromotionType promotionType;
    private Double discountValue;
    private LocalDate validFrom;
    private LocalDate validTill;
    private Double minimumOrderValue;
    private Integer maxUses;
    private Integer usagePerCustomer;
    private List<Category> categories;

    @Data
    public static class Category {
        private Integer categoryId;
        private String name;
    }
}
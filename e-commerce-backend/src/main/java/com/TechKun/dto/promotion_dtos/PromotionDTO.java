package com.TechKun.dto.promotion_dtos;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.TechKun.model.enums.PromotionType;

import lombok.Data;

@Data
public class PromotionDTO {
    private String description;
    private PromotionType promotionType;
    private Double discountValue;
    private Optional<LocalDate> validFrom;
    private Optional<LocalDate> validTill;
    private Optional<Double> minimumOrderValue;
    private Optional<Integer> maxUses;
    private Optional<Integer> usagePerCustomer;
    private List<Integer> categoryIds;
}
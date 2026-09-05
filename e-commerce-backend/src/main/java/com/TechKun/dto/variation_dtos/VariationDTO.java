package com.TechKun.dto.variation_dtos;

import lombok.Data;
import java.util.List;

@Data
public class VariationDTO {
    private String name;
    private List<VariationOptionDTO> variationOptions;

    @Data
    public static class VariationOptionDTO {
        private Integer variationOptionId;
        private String name;
        private String code;
    }
}

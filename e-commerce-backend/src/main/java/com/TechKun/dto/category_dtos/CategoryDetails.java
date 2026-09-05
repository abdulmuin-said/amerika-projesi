package com.TechKun.dto.category_dtos;

import lombok.Data;
import java.util.List;
import java.util.Optional;

@Data
public class CategoryDetails {
    private Integer categoryId;
    private String name;
    private String code;
    private Optional<String> imageUrl;
    private CategoryDetails parentCategory;
    private List<VariationDTO> variations;
    private List<AttributeDTO> attributes;

    @Data
    public static class VariationDTO {
        private Integer variationId;
        private String name;
    }

    @Data
    public static class AttributeDTO {
        private Integer attributeId;
        private String name;
        private String type;
        private List<String> allowedValues;
    }
}
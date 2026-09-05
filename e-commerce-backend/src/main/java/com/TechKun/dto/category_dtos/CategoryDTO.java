package com.TechKun.dto.category_dtos;

import lombok.Data;
import java.util.List;
import java.util.Optional;

@Data
public class CategoryDTO {
    private String name;
    private String code;
    private Optional<Integer> parentCategoryId;
    private List<Integer> variationIds;
    private List<Integer> attributeIds;
    private Optional<String> imageUrl;
}
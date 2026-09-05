package com.TechKun.dto.category_dtos;

import java.util.List;
import java.util.Optional;

import lombok.Data;

@Data
public class CategoryTree {
    private Integer categoryId;
    private String name;
    private String code;
    private String path;
    private Optional<String> imageUrl;
    private List<CategoryTree> subcategories;
}
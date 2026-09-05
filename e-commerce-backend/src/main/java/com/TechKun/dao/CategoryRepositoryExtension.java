package com.TechKun.dao;

import com.TechKun.dto.category_dtos.CategoryDetails;
import com.TechKun.dto.category_dtos.CategoryTree;

import java.util.List;

public interface CategoryRepositoryExtension {
    List<CategoryTree> getCategoryTree();
    CategoryDetails getCategoryDetails(Integer categoryId);
}

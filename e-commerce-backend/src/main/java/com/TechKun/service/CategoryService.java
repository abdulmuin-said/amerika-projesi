package com.TechKun.service;

import java.util.*;
import java.util.stream.Collectors;

import com.TechKun.model.Attribute;
import com.TechKun.model.Variation;
import com.TechKun.repository.CategoryRepository;
import com.TechKun.repository.ProductRepository;
import com.TechKun.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TechKun.dto.category_dtos.*;
import com.TechKun.model.Category;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private PromotionRepository promotionRepository;
    @Autowired
    private ProductRepository productRepository;

    public Category createCategory(CategoryDTO categoryDTO) {
        Assert.hasText(categoryDTO.getName(), "Name must not be empty.");
        Assert.hasText(categoryDTO.getCode(), "Code must not be empty.");
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setCode(categoryDTO.getCode());
        if (categoryDTO.getImageUrl() != null && categoryDTO.getImageUrl().isPresent()) {
            category.setImageUrl(categoryDTO.getImageUrl().get());
        }
        if (categoryDTO.getParentCategoryId() != null && categoryDTO.getParentCategoryId().isPresent()) {
            Category parentCategory = new Category();
            parentCategory.setCategoryId(categoryDTO.getParentCategoryId().get());
            category.setParentCategory(parentCategory);
        }
        category.setVariations(categoryDTO.getVariationIds() != null ? categoryDTO.getVariationIds().stream()
                .map(Variation::new)
                .collect(Collectors.toList()) : new ArrayList<>());
        category.setAttributes(categoryDTO.getAttributeIds() != null ? categoryDTO.getAttributeIds().stream()
                .map(Attribute::new)
                .collect(Collectors.toList()) : new ArrayList<>());
        return this.categoryRepository.save(category);
    }

    public Category updateCategory(Integer categoryId, CategoryDTO categoryDTO) {
        boolean updateName = StringUtils.hasText(categoryDTO.getName());
        boolean updateCode = StringUtils.hasText(categoryDTO.getCode());
        boolean updateParentCategory = Objects.nonNull(categoryDTO.getParentCategoryId());
        boolean updateVariations = categoryDTO.getVariationIds() != null;
        boolean updateAttributes = categoryDTO.getAttributeIds() != null;
        boolean updateImageUrl = categoryDTO.getImageUrl() != null;
        System.out.println(categoryDTO);

        if (!(updateName || updateCode || updateParentCategory || updateVariations || updateAttributes
                || updateImageUrl))
            throw new IllegalStateException("At least one field must be provided for update.");

        Category category = this.categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found."));
        if (updateName)
            category.setName(categoryDTO.getName());
        if (updateCode)
            category.setCode(categoryDTO.getCode());
        if (updateParentCategory) {
            if (categoryDTO.getParentCategoryId().isEmpty())
                category.setParentCategory(null);
            else {
                Category parentCategory = new Category();
                parentCategory.setCategoryId(categoryDTO.getParentCategoryId().get());
                category.setParentCategory(parentCategory);
            }
        }
        if (updateVariations)
            category.setVariations(categoryDTO.getVariationIds()
                    .stream()
                    .map(Variation::new)
                    .collect(Collectors.toList()));
        if (updateAttributes)
            category.setAttributes(categoryDTO.getAttributeIds()
                    .stream()
                    .map(Attribute::new)
                    .collect(Collectors.toList()));
        if (updateImageUrl) {
            if (categoryDTO.getImageUrl().isEmpty())
                category.setImageUrl(null);
            else
                category.setImageUrl(categoryDTO.getImageUrl().get());
        }
        return this.categoryRepository.save(category);
    }

    public List<CategoryTree> getCategoryTree() {
        return this.categoryRepository.getCategoryTree();
    }

    public CategoryDetails getCategoryDetails(Integer categoryId) {
        return this.categoryRepository.getCategoryDetails(categoryId);
    }

    @Transactional
    // public void deleteCategory(Integer categoryId) {
    // List<Integer> subcategoryIds =
    // this.categoryRepository.getSubcategoryIds(categoryId);
    // subcategoryIds.add(categoryId);
    // this.promotionRepository.removePromotionCategoriesByCategoryId(subcategoryIds);
    // this.categoryRepository.deleteAllById(subcategoryIds);
    // }

    public void deleteCategory(Integer categoryId) {
        long productCount = productRepository.countProductsByCategoryId(categoryId);
        if (productCount > 0)
            throw new RuntimeException("Cannot delete category. It has associated products.");

        long subcategoryCount = categoryRepository.countByParentCategoryId(categoryId);
        if (subcategoryCount > 0)
            throw new RuntimeException("Cannot delete category. It has subcategories.");

        categoryRepository.deleteById(categoryId);
    }

    public List<Category> getFeaturedCategories() {
        return this.categoryRepository.findParentCategories();
    }

}

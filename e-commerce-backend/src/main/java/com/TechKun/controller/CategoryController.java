package com.TechKun.controller;

import com.TechKun.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.ResponseEntity;
import com.TechKun.dto.category_dtos.*;
import com.TechKun.model.Category;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(this.categoryService.createCategory(categoryDTO));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Integer categoryId,
            @RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(this.categoryService.updateCategory(categoryId, categoryDTO));
    }

    @GetMapping
    public ResponseEntity<List<CategoryTree>> getAllCategories() {
        return ResponseEntity.ok(this.categoryService.getCategoryTree());
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryDetails> getCategoryById(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(this.categoryService.getCategoryDetails(categoryId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Category>> getFeaturedCategories() {
        return ResponseEntity.ok(this.categoryService.getFeaturedCategories());
    }
}

package com.TechKun.dao;

import com.TechKun.dto.category_dtos.CategoryDetails;
import com.TechKun.dto.category_dtos.CategoryTree;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.core.util.Json;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.function.Function;

@Repository
public class CategoryRepositoryImpl implements CategoryRepositoryExtension {
    @Autowired
    private EntityManager em;

    @Override
    public List<CategoryTree> getCategoryTree() {
        String nativeQuery = """
            SELECT c.*
            FROM category c
            ORDER BY c.category_id ASC
        """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = em.createNativeQuery(nativeQuery, Map.class).getResultList();
        // Step 1: Map from parentId to list of children
        Map<Integer, List<Map<String, Object>>> parentIdToChildren = new HashMap<>();
        for (Map<String, Object> result : results) {
            Integer parentId = (Integer) result.get("parent_id");
            parentIdToChildren
                .computeIfAbsent(parentId, k -> new ArrayList<>())
                .add(result);
        }

        // Step 2: Recursively build the tree starting from root categories
        return buildTree(null, null, parentIdToChildren);
    }

    private List<CategoryTree> buildTree(Integer parentId, String parentPath, Map<Integer, List<Map<String, Object>>> parentIdToChildren) {
        List<CategoryTree> result = new ArrayList<>();
        List<Map<String, Object>> children = parentIdToChildren.getOrDefault(parentId, Collections.emptyList());

        for (int i = 0; i < children.size(); i ++) {
            Map<String, Object> child = children.get(i);
            String path = parentPath != null ? parentPath + "." + i: String.valueOf(i);
            CategoryTree node = new CategoryTree();
            Integer childId = (Integer) child.get("category_id");
            node.setCategoryId(childId);
            node.setPath(path);
            node.setName((String) child.get("name"));
            node.setCode((String) child.get("code"));
            node.setImageUrl(Optional.ofNullable((String) child.get("image_url")));
            node.setSubcategories(buildTree(childId, path, parentIdToChildren));
            result.add(node);
        }

        return result;
    }

    @Override
    @SuppressWarnings("unchecked")
    public CategoryDetails getCategoryDetails(Integer cId) {
        String nativeQuery = """
            WITH RECURSIVE parent_chain AS (
                SELECT pc.*
                FROM category pc
                WHERE pc.category_id = :categoryId
                UNION ALL
                SELECT gp.*
                FROM category gp
                JOIN parent_chain chain ON chain.parent_id = gp.category_id
            ),
            filtered_category_variation AS (
                SELECT *
                FROM category_variation cv
                WHERE cv.category_id IN (SELECT category_id FROM parent_chain)
            ),
            filtered_category_attribute AS (
                SELECT *
                FROM category_attribute ca
                WHERE ca.category_id IN (SELECT category_id FROM parent_chain)
            ),
            aggregated_variations AS (
                SELECT
                    cv.category_id,
                    jsonb_agg(jsonb_build_object(
                        'variationId', v.variation_id,
                        'name', v.name
                    )) AS variations
                FROM filtered_category_variation cv
                LEFT JOIN variation v ON v.variation_id = cv.variation_id
                GROUP BY cv.category_id
            ),
            aggregated_attributes AS (
                SELECT
                    ca.category_id,
                    jsonb_agg(jsonb_build_object(
                        'attributeId', a.attribute_id,
                        'name', a.name,
                        'type', a.type,
                        'allowedValues', a.allowed_values
                    )) AS attributes
                FROM filtered_category_attribute ca
                JOIN attribute a ON a.attribute_id = ca.attribute_id
                GROUP BY ca.category_id
            )
            SELECT
                c.*,
                av.variations,
                aa.attributes
            FROM parent_chain c
            LEFT JOIN aggregated_variations av ON av.category_id = c.category_id
            LEFT JOIN aggregated_attributes aa ON aa.category_id = c.category_id;
        """;
        List<Map<String, Object>> results = em.createNativeQuery(nativeQuery, Map.class)
            .setParameter("categoryId", cId).getResultList();

        Map<Integer, CategoryDetails> categoryDetailsMap = new HashMap<>();
        Function<Integer, CategoryDetails> idToCategoryMapper = id -> {
            CategoryDetails cd = new CategoryDetails();
            cd.setCategoryId(id);
            return cd;
        };
        results.forEach(res -> {
            Integer categoryId = (Integer) res.get("category_id");
            CategoryDetails categoryDetails = categoryDetailsMap.computeIfAbsent(categoryId, idToCategoryMapper);
            categoryDetails.setName((String) res.get("name"));
            categoryDetails.setCode((String) res.get("code"));
            categoryDetails.setImageUrl(Optional.ofNullable((String) res.get("image_url")));
            List<Map<String, Object>> variations = null;
            List<Map<String, Object>> attributes = null;
            try {
                String variationsString = (String) res.get("variations");
                if (StringUtils.hasText(variationsString))
                    variations = Json.mapper().readValue(variationsString, List.class);
                String attributesString = (String) res.get("attributes");
                if (StringUtils.hasText(attributesString))
                    attributes = Json.mapper().readValue(attributesString, List.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            categoryDetails.setVariations(variations != null ?
                variations.stream()
                    .map(v -> {
                        CategoryDetails.VariationDTO variationDTO = new CategoryDetails.VariationDTO();
                        variationDTO.setVariationId((Integer) v.get("variationId"));
                        variationDTO.setName((String) v.get("name"));
                        return variationDTO;
                    })
                    .toList():
                new ArrayList<>()
            );
            categoryDetails.setAttributes(attributes != null ?
                attributes.stream()
                    .map(a -> {
                        CategoryDetails.AttributeDTO attributeDTO = new CategoryDetails.AttributeDTO();
                        attributeDTO.setAttributeId((Integer) a.get("attributeId"));
                        attributeDTO.setName((String) a.get("name"));
                        attributeDTO.setType((String) a.get("type"));
                        attributeDTO.setAllowedValues((List<String>) a.get("allowedValues"));
                        return attributeDTO;
                    })
                    .toList():
                new ArrayList<>()
            );
            Integer parentId = (Integer) res.get("parent_id");
            if (parentId == null)
                return;
            CategoryDetails parentCategory = categoryDetailsMap.computeIfAbsent(parentId, idToCategoryMapper);
            categoryDetails.setParentCategory(parentCategory);
        });
        return categoryDetailsMap.get(cId);
    }
}

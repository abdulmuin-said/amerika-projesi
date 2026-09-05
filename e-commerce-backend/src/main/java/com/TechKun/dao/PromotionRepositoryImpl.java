package com.TechKun.dao;

import com.TechKun.dto.promotion_dtos.PromotionDetails;
import com.TechKun.model.enums.PromotionType;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Repository
public class PromotionRepositoryImpl implements PromotionRepositoryExtension {
    @Autowired
    private EntityManager em;

    @Override
    public List<PromotionDetails> findPromotionDetails() {
        String nativeQuery = """
            SELECT p.*, c.*
            FROM promotion p
            LEFT JOIN promotion_category pc ON p.promotion_id = pc.promotion_id
            LEFT JOIN category c ON pc.category_id = c.category_id;
        """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = em.createNativeQuery(nativeQuery, Map.class).getResultList();

        Map<Integer, PromotionDetails> promotionDetailsMap = new HashMap<>();
        result.forEach(item -> {
            Integer promotionId = (Integer) item.get("promotion_id");
            PromotionDetails promotionDetails = promotionDetailsMap.computeIfAbsent(promotionId, id -> {
                PromotionDetails pd = new PromotionDetails();
                Number discountValue = (Number) item.get("discount_value");
                Number minimumOrderValue = (Number) item.get("minimum_order_value");
                Number maxUses = (Number) item.get("max_uses");
                Number usagePerCustomer = (Number) item.get("usage_per_customer");
                pd.setPromotionId(id);
                pd.setDescription((String) item.get("description"));
                pd.setPromotionType(PromotionType.valueOf((String) item.get("promotion_type")));
                pd.setDiscountValue(discountValue != null ? discountValue.doubleValue() : null);
                Date validFrom = ((Date) item.get("valid_from"));
                pd.setValidFrom(validFrom != null ? validFrom.toLocalDate(): null);
                Date validTill = ((Date) item.get("valid_till"));
                pd.setValidTill(validTill != null ? validTill.toLocalDate(): null);
                pd.setMinimumOrderValue(minimumOrderValue != null ? minimumOrderValue.doubleValue() : null);
                pd.setMaxUses(maxUses != null ? maxUses.intValue() : null);
                pd.setUsagePerCustomer(usagePerCustomer != null ? usagePerCustomer.intValue() : null);
                pd.setCategories(new ArrayList<>());
                return pd;
            });
            Integer categoryId = (Integer) item.get("category_id");
            if (Objects.isNull(categoryId))
                return;

            PromotionDetails.Category category = new PromotionDetails.Category();
            category.setCategoryId(categoryId);
            category.setName((String) item.get("name"));
            promotionDetails.getCategories().add(category);
        });

        return new ArrayList<>(promotionDetailsMap.values());
    }
}

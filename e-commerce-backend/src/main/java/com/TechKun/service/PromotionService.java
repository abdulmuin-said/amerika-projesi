package com.TechKun.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.TechKun.helper.UpdateManager;
import com.TechKun.model.Category;
import com.TechKun.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.TechKun.dto.promotion_dtos.*;
import com.TechKun.model.Promotion;
import org.springframework.util.Assert;

@Service
public class PromotionService {
    @Autowired
    private PromotionRepository promotionRepository;

    public List<PromotionDetails> getAllPromotions() {
        return this.promotionRepository.findPromotionDetails();
    }

    public Promotion createPromotion(PromotionDTO promotionDTO) {
        Assert.hasText(promotionDTO.getDescription(), "Description must not be empty.");
        Assert.notNull(promotionDTO.getPromotionType(), "Promotion type must not be null.");
        Assert.isTrue(
            promotionDTO.getDiscountValue() != null && promotionDTO.getDiscountValue() > 0.0,
            "Discount value must be greater than 0."
        );
        var updateManager = UpdateManager.ofSource(promotionDTO);
        updateManager.<List<Integer>>updateConfig("categoryIds")
            .targetPropertyName("categories")
            .validator(catIds -> true)
            .mapper(catIds -> catIds != null ?
                catIds.stream()
                    .map(Category::new)
                    .collect(Collectors.toList()) :
                new ArrayList<>()
            )
            .add();

        Promotion promotion = new Promotion();
        updateManager.updateProperties(promotion);

        return this.promotionRepository.save(promotion);
    }

    public Promotion updatePromotion(
        Integer promotionId,
        PromotionDTO promotionDTO
    ) {
        if (promotionDTO.getDiscountValue() != null)
            Assert.isTrue(promotionDTO.getDiscountValue() > 0.0, "Discount value must be greater than 0.");
        var updateManager = UpdateManager.ofSource(promotionDTO);
        updateManager.<List<Integer>>updateConfig("categoryIds")
            .targetPropertyName("categories")
            .mapper(catIds -> catIds.stream()
                .map(Category::new)
                .collect(Collectors.toList())
            )
            .add();

        if (updateManager.nothingToUpdate())
            throw new IllegalStateException("At least one field must be provided for update.");

        Promotion promotion = this.promotionRepository.findById(promotionId)
            .orElseThrow(() -> new RuntimeException("Promotion not found."));
        updateManager.updateProperties(promotion);

        return this.promotionRepository.save(promotion);
    }

//    public void deletePromotion(Integer promotionId) {
//        this.promotionRepository.deleteById(promotionId);
//    }
public void deletePromotion(Integer promotionId) {
    long count = promotionRepository.countOrdersUsingPromotion(promotionId);
    if (count > 0) {
        throw new RuntimeException("Cannot delete promotion. It is used in existing orders.");
    }
    promotionRepository.deleteById(promotionId);
}


}

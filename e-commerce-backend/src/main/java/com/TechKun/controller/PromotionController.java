package com.TechKun.controller;

import com.TechKun.dto.promotion_dtos.PromotionDTO;
import com.TechKun.model.Promotion;
import com.TechKun.dto.promotion_dtos.PromotionDetails;
import com.TechKun.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/promotions")
public class PromotionController {
    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<PromotionDetails>> getAllPromotions() {
        return ResponseEntity.ok(this.promotionService.getAllPromotions());
    }

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        return ResponseEntity.ok(this.promotionService.createPromotion(promotionDTO));
    }

    @PutMapping("/{promotionId}")
    public ResponseEntity<Promotion> updatePromotion(
            @PathVariable Integer promotionId,
            @RequestBody PromotionDTO promotionDTO
    ) {
        return ResponseEntity.ok(this.promotionService.updatePromotion(promotionId, promotionDTO));
    }

    @DeleteMapping("/{promotionId}")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer promotionId) {
        promotionService.deletePromotion(promotionId);
        return ResponseEntity.ok("Promotion deleted successfully");
    }

}

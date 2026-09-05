package com.TechKun.controller;

import com.TechKun.dto.variation_dtos.VariationDTO;
import com.TechKun.model.Variation;
import com.TechKun.service.VariationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/variations")
public class VariationController {
    @Autowired
    private VariationService variationService;

    @GetMapping
    public ResponseEntity<List<Variation>> getAllVariations(
        @RequestParam(required = false) Integer categoryId
    ) {
        return ResponseEntity.ok(this.variationService.getAllVariations(categoryId));
    }

    @PostMapping
    public ResponseEntity<Variation> createVariation(
        @RequestBody VariationDTO variationDTO
    ) {
        return ResponseEntity.ok(this.variationService.createVariation(variationDTO));
    }

    @PutMapping("/{variationId}")
    public ResponseEntity<Variation> updateVariation(
        @PathVariable Integer variationId,
        @RequestBody VariationDTO variationDTO
    ) {
        return ResponseEntity.ok(this.variationService.updateVariation(variationId, variationDTO));
    }

//    @DeleteMapping("/{variationId}")
//    public ResponseEntity<Void> deleteVariation(
//        @PathVariable Integer variationId
//    ) {
//        this.variationService.deleteVariation(variationId);
//        return ResponseEntity.noContent().build();
//    }
@DeleteMapping("/{variationId}")
public ResponseEntity<?> deleteVariation(@PathVariable Integer variationId) {
    variationService.deleteVariation(variationId);
    return ResponseEntity.ok("Variation deleted successfully");
}


}

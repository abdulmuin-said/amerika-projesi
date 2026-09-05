package com.TechKun.controller;

import com.TechKun.dto.shipping_method_dtos.ShippingMethodDTO;
import com.TechKun.model.ShippingMethod;
import com.TechKun.service.ShippingMethodService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shipping-methods")
public class ShippingMethodController {

    @Autowired
    private ShippingMethodService shippingMethodService;

    @PostMapping
    public ResponseEntity<ShippingMethod> createShippingMethod(@RequestBody ShippingMethodDTO shippingMethodDto) {
        return ResponseEntity.ok(
                shippingMethodService.createShippingMethod(shippingMethodDto));
    }

    @GetMapping
    public ResponseEntity<List<ShippingMethod>> getAllShippingMethods(
            @RequestParam(required = false) String country) {
        return ResponseEntity.ok(
                shippingMethodService.getAllShippingMethods(country));
    }

    @PutMapping("/{shippingMethodId}")
    public ResponseEntity<ShippingMethod> updateShippingMethod(
            @PathVariable Integer shippingMethodId,
            @RequestBody ShippingMethodDTO shippingMethodDto) {
        return ResponseEntity.ok(
                shippingMethodService.updateShippingMethod(
                        shippingMethodId, shippingMethodDto));
    }

    @DeleteMapping("/{shippingMethodId}")
    public ResponseEntity<Void> deleteShippingMethod(
            @PathVariable Integer shippingMethodId) {
        shippingMethodService.deleteShippingMethod(shippingMethodId);
        return ResponseEntity.noContent().build();
    }
     @GetMapping("/by-variant/{variantId}")
    public ResponseEntity<ShippingMethod> getByVariant(@PathVariable Integer variantId) {
        ShippingMethod method = shippingMethodService.getByProductVariantId(variantId);
        if (method == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(method);
    }
}

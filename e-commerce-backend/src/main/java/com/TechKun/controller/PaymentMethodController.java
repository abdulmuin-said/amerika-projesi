package com.TechKun.controller;

import com.TechKun.dto.payment_method_dtos.PaymentMethodDTO;
import com.TechKun.model.PaymentMethod;
import com.TechKun.model.ShopUser;
import com.TechKun.service.PaymentMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment-methods")
public class PaymentMethodController {
    @Autowired
    private PaymentMethodService paymentMethodService;

    @PostMapping
    public ResponseEntity<PaymentMethod> createPaymentMethod(@AuthenticationPrincipal ShopUser loggedInUser,
            @RequestBody PaymentMethodDTO paymentMethodDTO) {
        return ResponseEntity.ok(this.paymentMethodService.createPaymentMethod(loggedInUser, paymentMethodDTO));
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods(@AuthenticationPrincipal ShopUser loggedInUser) {
        return ResponseEntity.ok(this.paymentMethodService.getAllPaymentMethods(loggedInUser));
    }

    @PutMapping("/{paymentMethodId}")
    public ResponseEntity<PaymentMethod> updatePaymentMethod(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer paymentMethodId,
            @RequestBody PaymentMethodDTO paymentMethodDTO) {
        return ResponseEntity.ok(this.paymentMethodService.updatePaymentMethod(loggedInUser, paymentMethodId, paymentMethodDTO));
    }

    @DeleteMapping("/{paymentMethodId}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Integer paymentMethodId) {
        this.paymentMethodService.deletePaymentMethod(paymentMethodId);
        return ResponseEntity.noContent().build();
    }
}

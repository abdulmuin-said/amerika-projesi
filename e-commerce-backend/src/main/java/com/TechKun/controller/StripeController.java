package com.TechKun.controller;

import com.TechKun.config.StripeConfig;
import com.TechKun.dto.stripe_dtos.ConfirmPaymentRequest;
import com.TechKun.dto.stripe_dtos.CreatePaymentIntentRequest;
import com.TechKun.dto.stripe_dtos.PaymentIntentResponse;
import com.TechKun.model.ShopUser;
import com.TechKun.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/stripe")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @Autowired
    private StripeConfig stripeConfig;

    /**
     * GET /stripe/config
     * Returns the Stripe publishable key to the client.
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", stripeConfig.getPublishableKey()));
    }

    /**
     * POST /stripe/create-payment-intent
     * Authenticated user creates a pending order + Stripe PaymentIntent.
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @RequestBody CreatePaymentIntentRequest request) {

        PaymentIntentResponse response = stripeService.createPaymentIntent(request, loggedInUser);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /stripe/confirm
     * Confirms that a PaymentIntent has succeeded and marks order as CONFIRMED.
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @RequestBody ConfirmPaymentRequest request) {

        Integer orderId = stripeService.confirmPayment(request.getPaymentIntentId(), request.getOrderId());
        if (orderId != null) {
            return ResponseEntity.ok(Map.of("status", "success", "orderId", orderId));
        } else {
            return ResponseEntity.ok(Map.of("status", "failed", "reason", "confirmation_failed"));
        }
    }

    /**
     * POST /stripe/webhook
     * Stripe server-to-server webhook endpoint.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Received");
    }
}

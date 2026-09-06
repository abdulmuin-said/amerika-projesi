package com.TechKun.controller;

import com.TechKun.dto.paytr_dtos.PayTRTokenRequest;
import com.TechKun.dto.paytr_dtos.PayTRTokenResponse;
import com.TechKun.model.ShopUser;
import com.TechKun.service.PayTRService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/paytr")
@Slf4j
public class PayTRController {

    @Autowired
    private PayTRService payTRService;

    /**
     * POST /paytr/get-token
     * Generates a PayTR iframe token for TRY (TL) or USD.
     * Supports both authenticated users and guest checkouts.
     */
    @PostMapping("/get-token")
    public ResponseEntity<PayTRTokenResponse> getPaymentToken(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @RequestBody PayTRTokenRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = httpRequest.getRemoteAddr();
        } else {
            clientIp = clientIp.split(",")[0].trim();
        }

        PayTRTokenResponse response = payTRService.createPaymentToken(request, loggedInUser, clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /paytr/callback
     * PayTR IPN webhook notification endpoint.
     * Receives POST parameters from PayTR servers (form-urlencoded).
     * Must return raw text "OK" on success so PayTR stops retrying.
     */
    @PostMapping(value = "/callback", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.ALL_VALUE})
    public ResponseEntity<String> handleCallback(@RequestParam Map<String, String> params) {
        log.info("PayTR IPN Callback invoked with params: {}", params);
        String result = payTRService.handleCallback(params);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /paytr/confirm-test
     * Marks an order as CONFIRMED when running in Sandbox/Demo mode.
     */
    @PostMapping("/confirm-test")
    public ResponseEntity<Map<String, Object>> confirmTestOrder(@RequestBody Map<String, Object> request) {
        Object orderIdObj = request.get("orderId");
        if (orderIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "orderId is required"));
        }

        Integer orderId = Integer.parseInt(orderIdObj.toString());
        Integer confirmedId = payTRService.confirmTestOrder(orderId);

        if (confirmedId != null) {
            return ResponseEntity.ok(Map.of("status", "success", "orderId", confirmedId));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Order not found or could not be confirmed"));
        }
    }
}

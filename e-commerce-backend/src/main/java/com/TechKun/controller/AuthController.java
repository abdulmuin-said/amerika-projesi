package com.TechKun.controller;

import com.TechKun.dto.UserEssentials;
import com.TechKun.model.ShopUser;
import com.TechKun.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.TechKun.dto.auth_dtos.*;

import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ShopUser> register(@RequestBody RegistrationPayload payload) {
        return ResponseEntity.ok(this.authService.register(payload));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenPayload> login(@RequestBody LoginPayload payload) {
        return ResponseEntity.ok(this.authService.login(payload));
    }

    @GetMapping("/me")
    public ResponseEntity<UserEssentials> me(@AuthenticationPrincipal ShopUser loggedInUser) {
        return ResponseEntity.ok(this.authService.getUserEssentials(loggedInUser));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordPayload payload) {
        return ResponseEntity.ok(this.authService.forgotPassword(payload));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordPayload payload) {
        return ResponseEntity.ok(this.authService.resetPassword(payload));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal ShopUser shopUser,
            @RequestBody ChangePasswordPayload payload
    ) {
        return ResponseEntity.ok(this.authService.changePassword(shopUser, payload));
    }

    @PutMapping("/delete-account")
    public ResponseEntity<Map<String, Object>> deleteAccount(
            @AuthenticationPrincipal ShopUser shopUser,
            @RequestBody DeleteAccountPayload payload
    ) {
        return ResponseEntity.ok(this.authService.deleteAccount(shopUser, payload));
    }
}
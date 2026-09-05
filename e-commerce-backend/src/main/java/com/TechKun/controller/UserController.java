package com.TechKun.controller;

import com.TechKun.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.TechKun.dto.user_dtos.*;
import com.TechKun.model.ShopUser;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<ShopUser>> getAllUsers(@RequestBody(required = false) UserQueryOptions userQueryOptions) {
        return ResponseEntity.ok(this.userService.getAllUsers(userQueryOptions));
    }

    @PutMapping
    public ResponseEntity<ShopUser> updateUser(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestBody UserUpdatePayload payload
    ) {
        return ResponseEntity.ok(this.userService.updateUser(loggedInUser, payload));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> removeUser(@PathVariable Integer userId) {
        this.userService.removeUser(userId);
        return ResponseEntity.noContent().build();
    }
}
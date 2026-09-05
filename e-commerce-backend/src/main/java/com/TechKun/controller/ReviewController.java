package com.TechKun.controller;

import com.TechKun.model.ShopUser;
import com.TechKun.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.TechKun.dto.review_dtos.ReviewDTO;
import com.TechKun.dto.review_dtos.ReviewDetails;
import com.TechKun.model.Review;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewDetails>> getReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(this.reviewService.getReviews(
                productId, customerId, page, size, sort));
    }

    @PostMapping
    public ResponseEntity<Review> postReview(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(this.reviewService.postReview(
                loggedInUser, reviewDTO));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> editReview(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer reviewId,
            @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(this.reviewService.editReview(
                loggedInUser, reviewId, reviewDTO));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer reviewId) {
        this.reviewService.deleteReview(loggedInUser, reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ReviewDetails>> getFeaturedReviews() {
        return ResponseEntity.ok(this.reviewService.getFeaturedReviews());
    }
}

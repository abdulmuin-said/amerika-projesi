package com.TechKun.service;

import java.time.LocalDateTime;
import java.util.List;

import com.TechKun.model.Product;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.TechKun.model.Review;
import com.TechKun.dto.review_dtos.*;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public List<ReviewDetails> getReviews(
        Integer productId, Integer customerId,
        Integer page, Integer size, String sort
    ) {
        return this.reviewRepository.getReviews(productId, customerId, page, size, sort);
    }
    public Review postReview(ShopUser loggedInUser, ReviewDTO reviewDTO) {
        Assert.hasText(reviewDTO.getReviewText(), "Review text must not be empty.");
        Assert.notNull(reviewDTO.getRating(), "Rating must not be null.");
        Assert.notNull(reviewDTO.getProductId(), "Product ID must not be null.");

        Review review = new Review();
        review.setReviewText(reviewDTO.getReviewText());
        review.setRating(reviewDTO.getRating());
        review.setUser(loggedInUser);
        review.setDateOfSubmission(LocalDateTime.now());
        review.setProduct(new Product(reviewDTO.getProductId()));

        return this.reviewRepository.save(review);
    }
    public Review editReview(ShopUser loggedInUser, Integer reviewId, ReviewDTO reviewDTO) {
        boolean updateReviewText = StringUtils.hasText(reviewDTO.getReviewText());
        boolean updateRating = reviewDTO.getRating() != null;

        if (!(updateReviewText || updateRating))
            throw new RuntimeException("At least one field must be provided for update.");

        Review review = this.reviewRepository.getLiteReview(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found."));

        if (!(
            loggedInUser.getUserId().equals(review.getUser().getUserId())
            || loggedInUser.isAdmin()
        ))
            throw new AccessDeniedException("You are not authorized to edit this review.");

        if (updateReviewText)
            review.setReviewText(reviewDTO.getReviewText());
        if (updateRating)
            review.setRating(reviewDTO.getRating());

        return this.reviewRepository.save(review);
    }
    public void deleteReview(ShopUser loggedInUser, Integer reviewId) {
        Review review = this.reviewRepository.getLiteReview(reviewId)
           .orElseThrow(() -> new RuntimeException("Review not found."));

        if (!(
            loggedInUser.getUserId().equals(review.getUser().getUserId())
            || loggedInUser.isAdmin()
        ))
            throw new AccessDeniedException("You are not authorized to delete this review.");

        this.reviewRepository.delete(review);
    }

    public List<ReviewDetails> getFeaturedReviews() {
        return this.reviewRepository.getFeaturedReviews();
    }
}

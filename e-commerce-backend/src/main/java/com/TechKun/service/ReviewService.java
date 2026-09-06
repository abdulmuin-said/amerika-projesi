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
        Integer page, Integer size, String sort,
        Boolean approvedOnly
    ) {
        return this.reviewRepository.getReviews(productId, customerId, page, size, sort, approvedOnly);
    }
    public Review postReview(ShopUser loggedInUser, ReviewDTO reviewDTO) {
        Assert.hasText(reviewDTO.getReviewText(), "Review text must not be empty.");
        Assert.notNull(reviewDTO.getRating(), "Rating must not be null.");
        Assert.notNull(reviewDTO.getProductId(), "Product ID must not be null.");

        Review review = new Review();
        review.setReviewText(reviewDTO.getReviewText());
        review.setReviewTextTr(StringUtils.hasText(reviewDTO.getReviewTextTr()) ? reviewDTO.getReviewTextTr() : reviewDTO.getReviewText());
        review.setRating(reviewDTO.getRating());
        review.setIsApproved(true);
        review.setUser(loggedInUser);
        review.setDateOfSubmission(LocalDateTime.now());
        review.setProduct(new Product(reviewDTO.getProductId()));

        return this.reviewRepository.save(review);
    }
    public Review editReview(ShopUser loggedInUser, Integer reviewId, ReviewDTO reviewDTO) {
        boolean updateReviewText = StringUtils.hasText(reviewDTO.getReviewText());
        boolean updateReviewTextTr = StringUtils.hasText(reviewDTO.getReviewTextTr());
        boolean updateRating = reviewDTO.getRating() != null;
        boolean updateApproval = reviewDTO.getIsApproved() != null;

        if (!(updateReviewText || updateReviewTextTr || updateRating || updateApproval))
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
        if (updateReviewTextTr)
            review.setReviewTextTr(reviewDTO.getReviewTextTr());
        if (updateRating)
            review.setRating(reviewDTO.getRating());
        if (updateApproval)
            review.setIsApproved(reviewDTO.getIsApproved());

        return this.reviewRepository.save(review);
    }

    public Review toggleApproval(ShopUser loggedInUser, Integer reviewId) {
        if (!loggedInUser.isAdmin())
            throw new AccessDeniedException("Only administrators can moderate reviews.");

        Review review = this.reviewRepository.getLiteReview(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found."));

        review.setIsApproved(!Boolean.TRUE.equals(review.getIsApproved()));
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

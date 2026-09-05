package com.TechKun.dao;

import java.util.List;
import java.util.Optional;

import com.TechKun.dto.review_dtos.*;
import com.TechKun.model.Review;

public interface ReviewRepositoryExtension {
    List<ReviewDetails> getReviews(
        Integer productId,
        Integer customerId,
        Integer page,
        Integer size,
        String sort
    );

    Optional<Review> getLiteReview(Integer reviewId);
    List<ReviewDetails> getFeaturedReviews();
}

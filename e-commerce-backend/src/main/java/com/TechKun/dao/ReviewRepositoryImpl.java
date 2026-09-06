package com.TechKun.dao;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.TechKun.dto.CustomerContact;
import com.TechKun.dto.review_dtos.ReviewDetails;
import com.TechKun.model.Product;
import com.TechKun.model.Review;
import com.TechKun.model.ShopUser;

import jakarta.persistence.EntityManager;

@Repository
public class ReviewRepositoryImpl implements ReviewRepositoryExtension {
    @Autowired
    private EntityManager em;

    private ReviewDetails mapToReviewDetails(Map<String, Object> item) {
        ReviewDetails reviewDetails = new ReviewDetails();
        reviewDetails.setReviewId((Integer) item.get("review_id"));
        reviewDetails.setReviewText((String) item.get("review_text"));
        reviewDetails.setReviewTextTr((String) item.get("review_text_tr"));
        CustomerContact customerContact = new CustomerContact();
        customerContact.setCustomerId((Integer) item.get("user_id"));
        customerContact.setCustomerName((String) item.get("full_name"));
        customerContact.setEmail((String) item.get("email"));
        customerContact.setPhoneNumber((String) item.get("phone_no"));
        reviewDetails.setCustomer(customerContact);
        reviewDetails.setProductId((Integer) item.get("product_id"));
        reviewDetails.setRating(((Number) item.get("rating")).intValue());
        reviewDetails.setDateOfSubmission(((Timestamp) item.get("date_of_submission")).toLocalDateTime());
        reviewDetails.setVerifiedPurchase(item.get("verified_purchase") != null && (Boolean) item.get("verified_purchase"));
        return reviewDetails;
    }

    @Override
    public List<ReviewDetails> getReviews(Integer productId, Integer customerId, Integer page, Integer size, String sort) {
        String orderBy = switch (sort != null ? sort : "NEWEST") {
            case "HIGHEST_RATED" -> "ORDER BY r.rating DESC, r.date_of_submission DESC";
            case "LOWEST_RATED"  -> "ORDER BY r.rating ASC, r.date_of_submission DESC";
            default              -> "ORDER BY r.date_of_submission DESC";
        };
        String nativeQuery = """
                    SELECT
                        r.review_id,
                        r.review_text,
                        r.review_text_tr,
                        c.user_id,
                        c.full_name,
                        c.email,
                        c.phone_no,
                        r.product_id,
                        r.rating,
                        r.date_of_submission,
                        COUNT(*) OVER() AS total,
                        EXISTS (
                            SELECT 1
                            FROM shop_order so
                            JOIN order_item oi ON oi.order_id = so.order_id
                            JOIN product_variant pv ON pv.product_variant_id = oi.product_variant_id
                            WHERE so.customer_id = r.user_id
                            AND pv.product_id = r.product_id
                        ) AS verified_purchase
                    FROM review r
                    JOIN shop_user c ON r.user_id = c.user_id
                    WHERE (CAST(:productId AS INTEGER) IS NULL OR r.product_id = CAST(:productId AS INTEGER))
                    AND (CAST(:customerId AS INTEGER) IS NULL OR r.user_id = CAST(:customerId AS INTEGER))
                """ + orderBy;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
                .setParameter("productId", productId)
                .setParameter("customerId", customerId)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
        return result.stream()
                .map(this::mapToReviewDetails)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Review> getLiteReview(Integer reviewId) {
        String nativeQuery = """
                    SELECT
                        r.review_id,
                        r.review_text,
                        r.user_id,
                        r.product_id,
                        r.rating,
                        r.date_of_submission
                    FROM review r
                    WHERE r.review_id = :reviewId
                """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultList = this.em.createNativeQuery(nativeQuery, Map.class)
                .setParameter("reviewId", reviewId)
                .getResultList();
        if (resultList.isEmpty())
            return Optional.empty();

        Map<String, Object> result = resultList.get(0);
        Review review = new Review();
        review.setReviewId((Integer) result.get("review_id"));
        review.setReviewText((String) result.get("review_text"));
        review.setUser(new ShopUser((Integer) result.get("user_id")));
        review.setProduct(new Product((Integer) result.get("product_id")));
        review.setRating(((Number) result.get("rating")).floatValue());
        review.setDateOfSubmission(((Timestamp) result.get("date_of_submission")).toLocalDateTime());

        return Optional.of(review);
    }

    @Override
    public List<ReviewDetails> getFeaturedReviews() {
        String nativeQuery = """
                    SELECT
                        r.review_id,
                        r.review_text,
                        c.user_id,
                        c.full_name,
                        c.email,
                        c.phone_no,
                        r.product_id,
                        r.rating,
                        r.date_of_submission
                    FROM review r
                    JOIN shop_user c ON r.user_id = c.user_id
                    ORDER BY r.rating DESC
                    LIMIT 3
                """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> result = this.em.createNativeQuery(nativeQuery, Map.class)
                .getResultList();
        return result.stream()
                .map(this::mapToReviewDetails)
                .collect(Collectors.toList());
    }
}

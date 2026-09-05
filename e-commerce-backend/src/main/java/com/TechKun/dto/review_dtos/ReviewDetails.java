package com.TechKun.dto.review_dtos;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.TechKun.dto.CustomerContact;

@Data
public class ReviewDetails {
    private Integer reviewId;
    private String reviewText;
    private CustomerContact customer;
    private Integer productId;
    private Integer rating;
    private LocalDateTime dateOfSubmission;
    private Boolean verifiedPurchase;
}

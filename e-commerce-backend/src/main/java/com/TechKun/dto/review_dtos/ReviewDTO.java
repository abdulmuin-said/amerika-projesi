package com.TechKun.dto.review_dtos;

import lombok.Data;

@Data
public class ReviewDTO {
    private Integer productId;
    private Float rating;
    private String reviewText;
    private String reviewTextTr;
    private Boolean isApproved;
}
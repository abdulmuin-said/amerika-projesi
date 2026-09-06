package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "Review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "date_of_submission", nullable = false)
    private LocalDateTime dateOfSubmission;

    @Column(name = "rating", nullable = false)
    private Float rating;

    @Column(name = "review_text", nullable = false)
    private String reviewText;

    @Column(name = "review_text_tr")
    private String reviewTextTr;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = true;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private ShopUser user;

    @PrePersist
    protected void onCreate() {
        dateOfSubmission = LocalDateTime.now();
    }
}
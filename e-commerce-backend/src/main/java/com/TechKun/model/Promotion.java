package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

import com.TechKun.model.enums.PromotionType;

@Entity
@Data
@Table(name = "Promotion")
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id", nullable = false)
    private Integer promotionId;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type", nullable = false)
    private PromotionType promotionType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_till")
    private LocalDate validTill;

    @Column(name = "minimum_order_value")
    private Double minimumOrderValue;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "usage_per_customer")
    private Integer usagePerCustomer;

    @ManyToMany
    @JoinTable(name = "promotion_category",
        joinColumns = @JoinColumn(name = "promotion_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;
}
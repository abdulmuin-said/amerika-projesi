package com.TechKun.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ProductImage")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_image_id", nullable = false)
    private Integer productImageId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public ProductImage(Integer productImageId) {
        this.productImageId = productImageId;
    }

}

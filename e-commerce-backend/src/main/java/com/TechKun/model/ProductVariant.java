package com.TechKun.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ProductVariant")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_variant_id", nullable = false)
    private Integer productVariantId;

    @Column(name = "sku", nullable = false, unique = true)
    private String sku;

    @Column(name = "disabled", nullable = false)
    private Boolean disabled = false;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "price_try")
    private Double priceTry;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @ManyToMany()
    @JoinTable(name = "product_variant_property",
        joinColumns = @JoinColumn(name = "product_variant_id"),
        inverseJoinColumns = @JoinColumn(name = "variation_option_id")
    )
    private List<VariationOption> variationOptions;

    public ProductVariant(Integer productVariantId) {
        this.productVariantId = productVariantId;
    }
}

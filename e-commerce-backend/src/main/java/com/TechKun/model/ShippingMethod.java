package com.TechKun.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ShippingMethod")
public class ShippingMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipping_method_id", nullable = false)
    private Integer shippingMethodId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "origin_country", nullable = false)
    private String originCountry;

    @Column(name = "origin_postal_code", nullable = true)
    private String originPostalCode;

    @Column(name = "processing_time_min", nullable = false)
    private Integer processingTimeMin;

    @Column(name = "processing_time_max", nullable = false)
    private Integer processingTimeMax;

    @OneToMany(mappedBy = "shippingMethod", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShippingMethodOption> shippingOptions;

    public ShippingMethod(Integer shippingMethodId) {
        this.shippingMethodId = shippingMethodId;
    }
}

package com.TechKun.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "shipping_method_option")
@Data
public class ShippingMethodOption {

          @Id
          @GeneratedValue(strategy = GenerationType.IDENTITY)
          private Integer id;

          @ManyToOne
          @JoinColumn(name = "shipping_method_id", nullable = false)
          @JsonIgnore
          private ShippingMethod shippingMethod;

          @Column(name = "destination_country", nullable = false)
          private String destinationCountry;

          @Column(nullable = true)
          private String carrier;

          @Column(name = "cost_first_item", nullable = false)
          private Double costFirstItem;

          @Column(name = "cost_additional_item", nullable = true)
          private Double costAdditionalItem;

          @Column(name = "estimated_delivery_min", nullable = false)
          private Integer estimatedDeliveryMin;

          @Column(name = "estimated_delivery_max", nullable = false)
          private Integer estimatedDeliveryMax;
}

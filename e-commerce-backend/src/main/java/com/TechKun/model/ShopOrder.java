package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.TechKun.model.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "ShopOrder")
@Data
public class ShopOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @OneToMany(mappedBy = "shopOrder", orphanRemoval = true, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> orderItems;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private ShopUser customer;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @ManyToOne
    @JoinColumn(name = "shipping_address_id", nullable = false)
    private Address shippingAddress;

    @ManyToOne
    @JoinColumn(name = "payment_method_id", nullable = true)
    private PaymentMethod paymentMethod;

    // Unique internal tracking reference ID — links this order to a PaymentTransaction
    @Column(name = "conversation_id", unique = true)
    private String conversationId;

    @ManyToOne
    @JoinColumn(name = "shipping_method_id", nullable = true)
    private ShippingMethod shippingMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "estimated_delivery_date")
    private java.time.LocalDate estimatedDeliveryDate;

    @Column(name = "shipping_provider")
    private String shippingProvider;

    @Column(name = "payment_provider")
    private String paymentProvider;

    @Column(name = "carrier_name")
    private String carrierName;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "subtotal_amount", nullable = false)
    private Double subtotalAmount;

    @Column(name = "shipping_amount", nullable = false)
    private Double shippingAmount;

    @Column(name = "tax_amount", nullable = true)
    private Double taxAmount;

    @Column(name = "discount_amount", nullable = true)
    private Double discountAmount;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

}
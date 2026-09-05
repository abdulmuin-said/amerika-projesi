package com.TechKun.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "PaymentMethod")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id", nullable = false)
    private Integer paymentMethodId;

    @Column(name = "last4", nullable = false, length = 4)
    private String last4;

    @Column(name = "provider_token", nullable = false)
    private String providerToken;

    @Column(name = "expiry_month", nullable = false, length = 2)
    private String expiryMonth;

    @Column(name = "expiry_year", nullable = false, length = 2)
    private String expiryYear;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "card_holder_name", nullable = false)
    private String cardHolderName;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private ShopUser user;
    
    public PaymentMethod(Integer paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

}
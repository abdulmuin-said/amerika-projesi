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

    @Column(name = "last4", length = 4)
    private String last4 = "4242";

    @Column(name = "provider_token")
    private String providerToken = "stripe";

    @Column(name = "expiry_month", length = 2)
    private String expiryMonth = "12";

    @Column(name = "expiry_year", length = 2)
    private String expiryYear = "28";

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "card_holder_name")
    private String cardHolderName = "NovaCanvas Customer";

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private ShopUser user;
    
    public PaymentMethod(Integer paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}
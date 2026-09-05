package com.TechKun.model;

import com.TechKun.model.enums.PaymentTransactionStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "PaymentTransaction")
@Data
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_transaction_id")
    private Integer paymentTransactionId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private ShopOrder shopOrder;

    // Unique internal reference tracking ID
    @Column(name = "conversation_id", nullable = false, unique = true)
    private String conversationId;

    // Stripe PaymentIntent ID (e.g. pi_3MtwBwLkdIwHu7ix28a3tqPa)
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentTransactionStatus status = PaymentTransactionStatus.PENDING;

    @Column(name = "paid_price")
    private Double paidPrice;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @Column(name = "installment")
    private Integer installment;

    // 1 = clean, -1 = fraud flagged by payment gateway / Radar
    @Column(name = "fraud_status")
    private Integer fraudStatus;

    // Bank authorization code
    @Column(name = "auth_code")
    private String authCode;

    // e.g. "Visa", "MasterCard"
    @Column(name = "card_family")
    private String cardFamily;

    // First 6 digits — safe to store, used for card type identification
    @Column(name = "bin_number", length = 6)
    private String binNumber;

    // Last 4 digits — safe to store
    @Column(name = "last_four_digits", length = 4)
    private String lastFourDigits;

    // e.g. "VISA", "MASTER_CARD"
    @Column(name = "card_association")
    private String cardAssociation;

    // Populated only on failure
    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

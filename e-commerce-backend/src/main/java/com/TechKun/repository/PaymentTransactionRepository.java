package com.TechKun.repository;

import com.TechKun.model.PaymentTransaction;
import com.TechKun.model.enums.PaymentTransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Integer> {

    Optional<PaymentTransaction> findByConversationId(String conversationId);

    Optional<PaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<PaymentTransaction> findByShopOrder_OrderId(Integer orderId);

    @Query(value = """
        SELECT * FROM payment_transaction
        WHERE (CAST(:status AS TEXT) IS NULL OR status = CAST(:status AS TEXT))
          AND (CAST(:fromDate AS TIMESTAMP) IS NULL OR created_at >= CAST(:fromDate AS TIMESTAMP))
          AND (CAST(:toDate AS TIMESTAMP) IS NULL OR created_at <= CAST(:toDate AS TIMESTAMP))
        ORDER BY created_at DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM payment_transaction
        WHERE (CAST(:status AS TEXT) IS NULL OR status = CAST(:status AS TEXT))
          AND (CAST(:fromDate AS TIMESTAMP) IS NULL OR created_at >= CAST(:fromDate AS TIMESTAMP))
          AND (CAST(:toDate AS TIMESTAMP) IS NULL OR created_at <= CAST(:toDate AS TIMESTAMP))
        """,
        nativeQuery = true)
    Page<PaymentTransaction> findAllWithFilters(
        @Param("status") String status,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );

    @Query("SELECT SUM(pt.paidPrice) FROM PaymentTransaction pt WHERE pt.status = 'SUCCESS'")
    Double getTotalRevenue();

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.status = :status")
    Long countByStatus(@Param("status") PaymentTransactionStatus status);
}

package com.TechKun.controller;

import com.TechKun.dto.payment_dtos.PaymentSummaryDTO;
import com.TechKun.dto.payment_dtos.PaymentTransactionAdminDTO;
import com.TechKun.model.PaymentTransaction;
import com.TechKun.model.enums.PaymentTransactionStatus;
import com.TechKun.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payment-transactions")
public class PaymentTransactionController {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    /**
     * GET /payment-transactions
     * Admin only. Returns paginated payment transaction records with optional filters.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<Page<PaymentTransactionAdminDTO>> getAllTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String statusStr = (status != null && !status.isBlank()) ? status.toUpperCase() : null;

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;

        Page<PaymentTransaction> txPage = paymentTransactionRepository
                .findAllWithFilters(statusStr, from, to, PageRequest.of(page, size));

        List<PaymentTransactionAdminDTO> dtos = txPage.getContent()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new PageImpl<>(dtos, txPage.getPageable(), txPage.getTotalElements()));
    }

    /**
     * GET /payment-transactions/summary
     * Admin only. Returns total revenue, counts by status for the dashboard summary cards.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<PaymentSummaryDTO> getSummary() {
        Double totalRevenue = paymentTransactionRepository.getTotalRevenue();
        Long totalSuccessful = paymentTransactionRepository.countByStatus(PaymentTransactionStatus.SUCCESS);
        Long totalFailed = paymentTransactionRepository.countByStatus(PaymentTransactionStatus.FAILURE);
        Long totalPending = paymentTransactionRepository.countByStatus(PaymentTransactionStatus.PENDING);

        return ResponseEntity.ok(new PaymentSummaryDTO(
                totalRevenue != null ? totalRevenue : 0.0,
                totalSuccessful,
                totalFailed,
                totalPending
        ));
    }

    /**
     * GET /payment-transactions/{id}
     * Admin only. Returns a single transaction's full details.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<PaymentTransactionAdminDTO> getById(@PathVariable Integer id) {
        PaymentTransaction tx = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return ResponseEntity.ok(toDTO(tx));
    }

    private PaymentTransactionAdminDTO toDTO(PaymentTransaction tx) {
        PaymentTransactionAdminDTO dto = new PaymentTransactionAdminDTO();
        dto.setPaymentTransactionId(tx.getPaymentTransactionId());
        dto.setConversationId(tx.getConversationId());
        dto.setStripePaymentIntentId(tx.getStripePaymentIntentId());
        dto.setStatus(tx.getStatus());
        dto.setPaidPrice(tx.getPaidPrice());
        dto.setCurrency(tx.getCurrency());
        dto.setInstallment(tx.getInstallment());
        dto.setFraudStatus(tx.getFraudStatus());
        dto.setAuthCode(tx.getAuthCode());
        dto.setCardFamily(tx.getCardFamily());
        dto.setBinNumber(tx.getBinNumber());
        dto.setLastFourDigits(tx.getLastFourDigits());
        dto.setCardAssociation(tx.getCardAssociation());
        dto.setErrorCode(tx.getErrorCode());
        dto.setErrorMessage(tx.getErrorMessage());
        dto.setCreatedAt(tx.getCreatedAt());

        if (tx.getShopOrder() != null) {
            dto.setOrderId(tx.getShopOrder().getOrderId());
            if (tx.getShopOrder().getCustomer() != null) {
                dto.setCustomerName(tx.getShopOrder().getCustomer().getFullName());
                dto.setCustomerEmail(tx.getShopOrder().getCustomer().getEmail());
            }
        }

        return dto;
    }
}

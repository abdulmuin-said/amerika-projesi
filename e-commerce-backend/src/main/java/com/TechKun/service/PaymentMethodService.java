package com.TechKun.service;

import java.util.ArrayList;
import java.util.List;

import com.TechKun.repository.PaymentMethodRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import com.TechKun.dto.payment_method_dtos.PaymentMethodDTO;
import com.TechKun.model.PaymentMethod;
import com.TechKun.model.ShopUser;

@Service
public class PaymentMethodService {
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public PaymentMethod createPaymentMethod(@AuthenticationPrincipal ShopUser loggedInUser,
            PaymentMethodDTO paymentMethodDto) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setLast4(paymentMethodDto.getLast4());
        paymentMethod.setProviderToken(paymentMethodDto.getProviderToken());
        paymentMethod.setExpiryMonth(paymentMethodDto.getExpiryMonth());
        paymentMethod.setExpiryYear(paymentMethodDto.getExpiryYear());
        paymentMethod.setIsDefault(paymentMethodDto.getIsDefault());
        paymentMethod.setCardHolderName(paymentMethodDto.getCardHolderName());
        paymentMethod.setUser(loggedInUser);
        return this.paymentMethodRepository.save(paymentMethod);
    }

    public List<PaymentMethod> getAllPaymentMethods(ShopUser loggedInUser) {
        return this.paymentMethodRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("userId"), loggedInUser.getUserId()));
            return cb.and(predicates.toArray(Predicate[]::new));
        });
    }

    public PaymentMethod updatePaymentMethod(
            ShopUser loggedInUser,
            Integer paymentMethodId,
            PaymentMethodDTO paymentMethodDTO) {

        PaymentMethod paymentMethod = this.paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found."));

        boolean wasDefault = paymentMethod.getIsDefault();
        boolean willBeDefault = paymentMethodDTO.getIsDefault();

        paymentMethod.setLast4(paymentMethodDTO.getLast4());
        paymentMethod.setProviderToken(paymentMethodDTO.getProviderToken());
        paymentMethod.setExpiryMonth(paymentMethodDTO.getExpiryMonth());
        paymentMethod.setExpiryYear(paymentMethodDTO.getExpiryYear());
        if (!wasDefault && willBeDefault) {
            this.paymentMethodRepository.clearDefaultForUser(loggedInUser.getUserId());
            paymentMethod.setIsDefault(true);
        } else {
            paymentMethod.setIsDefault(paymentMethodDTO.getIsDefault());
        }
        paymentMethod.setCardHolderName(paymentMethodDTO.getCardHolderName());
        paymentMethod.setUser(loggedInUser);

        return this.paymentMethodRepository.save(paymentMethod);
    }

    public void deletePaymentMethod(Integer paymentMethodId) {
        this.paymentMethodRepository.deleteById(paymentMethodId);
    }
}

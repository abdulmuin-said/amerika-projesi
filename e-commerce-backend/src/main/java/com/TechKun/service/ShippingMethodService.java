package com.TechKun.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import io.jsonwebtoken.lang.Assert;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TechKun.dto.shipping_method_dtos.*;
import com.TechKun.dto.shipping_method_dtos.ShippingMethodDTO.ShippingMethodOptionDTO;
import com.TechKun.model.ShippingMethod;
import com.TechKun.model.ShippingMethodOption;
import com.TechKun.repository.ShippingMethodRepository;
import org.springframework.util.StringUtils;

@Service
public class ShippingMethodService {
    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    private void validateShippingMethodDto(ShippingMethodDTO dto) {
        Assert.hasText(dto.getName(), "Name must not be empty.");
        Assert.hasText(dto.getOriginCountry(), "Origin country must not be empty.");
        Assert.notNull(dto.getProcessingTimeMin(), "Processing time min must not be null.");
        Assert.notNull(dto.getProcessingTimeMax(), "Processing time max must not be null.");
    }

    private void validateShippingOptionDto(ShippingMethodOptionDTO dto) {
        Assert.hasText(dto.getDestinationCountry(), "Destination country must not be empty.");
        Assert.notNull(dto.getCostFirstItem(), "Cost for first item must not be null.");
        Assert.notNull(dto.getEstimatedDeliveryMin(), "Estimated delivery min must not be null.");
        Assert.notNull(dto.getEstimatedDeliveryMax(), "Estimated delivery max must not be null.");
    }

    public ShippingMethod createShippingMethod(ShippingMethodDTO dto) {
        this.validateShippingMethodDto(dto);

        ShippingMethod shippingMethod = new ShippingMethod();
        shippingMethod.setName(dto.getName());
        shippingMethod.setOriginCountry(dto.getOriginCountry());
        shippingMethod.setOriginPostalCode(dto.getOriginPostalCode());
        shippingMethod.setProcessingTimeMin(dto.getProcessingTimeMin());
        shippingMethod.setProcessingTimeMax(dto.getProcessingTimeMax());
        if (dto.getShippingOptions() != null) {
            shippingMethod.setShippingOptions(dto.getShippingOptions().stream().map(optDto -> {
                validateShippingOptionDto(optDto);
                ShippingMethodOption option = new ShippingMethodOption();
                option.setDestinationCountry(optDto.getDestinationCountry());
                option.setCarrier(optDto.getCarrier());
                option.setCostFirstItem(optDto.getCostFirstItem());
                option.setCostAdditionalItem(optDto.getCostAdditionalItem());
                option.setEstimatedDeliveryMin(optDto.getEstimatedDeliveryMin());
                option.setEstimatedDeliveryMax(optDto.getEstimatedDeliveryMax());
                option.setShippingMethod(shippingMethod);
                return option;
            }).collect(Collectors.toList()));
        } else {
            shippingMethod.setShippingOptions(new ArrayList<>());
        }

        return shippingMethodRepository.save(shippingMethod);
    }

    public List<ShippingMethod> getAllShippingMethods(
            String originCountry) {
        return shippingMethodRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(originCountry))
                predicates.add(cb.like(root.get("originCountry"), '%' + originCountry + '%'));
            return cb.and(predicates.toArray(Predicate[]::new));
        });
    }

    public ShippingMethod updateShippingMethod(
            Integer shippingMethodId,
            ShippingMethodDTO dto) {
        this.validateShippingMethodDto(dto);

        ShippingMethod shippingMethod = shippingMethodRepository.findById(shippingMethodId)
                .orElseThrow(() -> new RuntimeException("Shipping method not found."));
        shippingMethod.setName(dto.getName());
        shippingMethod.setOriginCountry(dto.getOriginCountry());
        shippingMethod.setOriginPostalCode(dto.getOriginPostalCode());
        shippingMethod.setProcessingTimeMin(dto.getProcessingTimeMin());
        shippingMethod.setProcessingTimeMax(dto.getProcessingTimeMax());

        // Refresh options: clear and re-add
        if (shippingMethod.getShippingOptions() == null) {
            shippingMethod.setShippingOptions(new ArrayList<>());
        } else {
            shippingMethod.getShippingOptions().clear();
        }
        if (dto.getShippingOptions() != null) {
            for (ShippingMethodOptionDTO optDto : dto.getShippingOptions()) {
                validateShippingOptionDto(optDto);
                ShippingMethodOption option = new ShippingMethodOption();
                option.setDestinationCountry(optDto.getDestinationCountry());
                option.setCarrier(optDto.getCarrier());
                option.setCostFirstItem(optDto.getCostFirstItem());
                option.setCostAdditionalItem(optDto.getCostAdditionalItem());
                option.setEstimatedDeliveryMin(optDto.getEstimatedDeliveryMin());
                option.setEstimatedDeliveryMax(optDto.getEstimatedDeliveryMax());
                option.setShippingMethod(shippingMethod);
                shippingMethod.getShippingOptions().add(option);
            }
        }

        return shippingMethodRepository.save(shippingMethod);
    }

    public void deleteShippingMethod(Integer shippingMethodId) {
        shippingMethodRepository.deleteById(shippingMethodId);
    }

     public ShippingMethod getByProductVariantId(Integer variantId) {
        return shippingMethodRepository.findByProductVariantId(variantId);
    }
}

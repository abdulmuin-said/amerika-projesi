package com.TechKun.dto.shipping_method_dtos;

import lombok.Data;
import java.util.List;

@Data
public class ShippingMethodDTO {
    private String name;
    private String originCountry;
    private String originPostalCode;
    private Integer processingTimeMin;
    private Integer processingTimeMax;
    private List<ShippingMethodOptionDTO> shippingOptions;

    @Data
    public static class ShippingMethodOptionDTO {
        private String destinationCountry;
        private String carrier;
        private Double costFirstItem;
        private Double costAdditionalItem;
        private Integer estimatedDeliveryMin;
        private Integer estimatedDeliveryMax;
    }
}

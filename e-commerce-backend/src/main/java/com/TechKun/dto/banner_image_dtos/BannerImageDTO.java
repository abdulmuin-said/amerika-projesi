package com.TechKun.dto.banner_image_dtos;

import lombok.Data;

import java.util.Optional;

@Data
public class BannerImageDTO {
    private Optional<String> imageUrl;
    private Optional<Boolean> isDefault;
}


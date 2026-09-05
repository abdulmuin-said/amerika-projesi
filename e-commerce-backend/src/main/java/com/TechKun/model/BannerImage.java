package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "banner_image")
public class BannerImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "banner_image_id", nullable = false)
    private Integer bannerImageId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    public BannerImage(Integer bannerImageId) {
        this.bannerImageId = bannerImageId;
    }
}


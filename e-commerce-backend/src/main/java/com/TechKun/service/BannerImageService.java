package com.TechKun.service;

import com.TechKun.dto.banner_image_dtos.BannerImageDTO;
import com.TechKun.model.BannerImage;
import com.TechKun.repository.BannerImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class BannerImageService {

    @Autowired
    private BannerImageRepository bannerImageRepository;

    public List<BannerImage> getAllBannerImages() {
        return this.bannerImageRepository.findAll();
    }

    public BannerImage getDefaultBannerImage() {
        return this.bannerImageRepository.findFirstByIsDefaultTrue()
            .orElseThrow(() -> new RuntimeException("Default banner image not found."));
    }

    @Transactional
    public BannerImage createBannerImage(BannerImageDTO bannerImageDTO) {
        Assert.notNull(bannerImageDTO, "Request body must not be null.");
        Assert.isTrue(
            bannerImageDTO.getImageUrl() != null && bannerImageDTO.getImageUrl().isPresent()
                && StringUtils.hasText(bannerImageDTO.getImageUrl().get()),
            "Image url must not be empty."
        );

        BannerImage bannerImage = new BannerImage();
        bannerImage.setImageUrl(bannerImageDTO.getImageUrl().get());
        bannerImage.setIsDefault(
            bannerImageDTO.getIsDefault() != null && bannerImageDTO.getIsDefault().orElse(false)
        );

        BannerImage saved = this.bannerImageRepository.save(bannerImage);
        if (Boolean.TRUE.equals(saved.getIsDefault())) {
            this.bannerImageRepository.makeDefault(saved.getBannerImageId());
            saved.setIsDefault(true);
        }
        return saved;
    }

    @Transactional
    public BannerImage updateBannerImage(Integer bannerImageId, BannerImageDTO bannerImageDTO) {
        Assert.notNull(bannerImageDTO, "Request body must not be null.");

        boolean updateImageUrl = bannerImageDTO.getImageUrl() != null;
        boolean updateIsDefault = bannerImageDTO.getIsDefault() != null;

        if (!(updateImageUrl || updateIsDefault)) {
            throw new IllegalStateException("At least one field must be provided for update.");
        }

        BannerImage bannerImage = this.bannerImageRepository.findById(bannerImageId)
            .orElseThrow(() -> new RuntimeException("Banner image not found."));

        if (updateImageUrl) {
            if (bannerImageDTO.getImageUrl().isEmpty()
                || !StringUtils.hasText(bannerImageDTO.getImageUrl().orElse(""))) {
                throw new IllegalStateException("Image url must not be empty.");
            }
            bannerImage.setImageUrl(bannerImageDTO.getImageUrl().get());
        }

        if (updateIsDefault) {
            boolean isDefault = bannerImageDTO.getIsDefault().orElse(false);
            bannerImage.setIsDefault(isDefault);
        }

        BannerImage saved = this.bannerImageRepository.save(bannerImage);
        if (Boolean.TRUE.equals(saved.getIsDefault())) {
            this.bannerImageRepository.makeDefault(saved.getBannerImageId());
            saved.setIsDefault(true);
        }
        return saved;
    }

    public void deleteBannerImage(Integer bannerImageId) {
        this.bannerImageRepository.deleteById(bannerImageId);
    }
}


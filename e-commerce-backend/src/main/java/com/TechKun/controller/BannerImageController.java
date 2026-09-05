package com.TechKun.controller;

import com.TechKun.dto.banner_image_dtos.BannerImageDTO;
import com.TechKun.model.BannerImage;
import com.TechKun.service.BannerImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/banner-images")
public class BannerImageController {

    @Autowired
    private BannerImageService bannerImageService;

    @GetMapping
    public ResponseEntity<List<BannerImage>> getAllBannerImages() {
        return ResponseEntity.ok(this.bannerImageService.getAllBannerImages());
    }

    @GetMapping("/default")
    public ResponseEntity<BannerImage> getDefaultBannerImage() {
        return ResponseEntity.ok(this.bannerImageService.getDefaultBannerImage());
    }

    @PostMapping
    public ResponseEntity<BannerImage> createBannerImage(@RequestBody BannerImageDTO bannerImageDTO) {
        return ResponseEntity.ok(this.bannerImageService.createBannerImage(bannerImageDTO));
    }

    @PutMapping("/{bannerImageId}")
    public ResponseEntity<BannerImage> updateBannerImage(
        @PathVariable Integer bannerImageId,
        @RequestBody BannerImageDTO bannerImageDTO
    ) {
        return ResponseEntity.ok(this.bannerImageService.updateBannerImage(bannerImageId, bannerImageDTO));
    }

    @DeleteMapping("/{bannerImageId}")
    public ResponseEntity<?> deleteBannerImage(@PathVariable Integer bannerImageId) {
        this.bannerImageService.deleteBannerImage(bannerImageId);
        return ResponseEntity.ok("Banner image deleted successfully");
    }
}


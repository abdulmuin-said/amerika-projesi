package com.TechKun.repository;

import com.TechKun.model.BannerImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BannerImageRepository extends JpaRepository<BannerImage, Integer> {

    Optional<BannerImage> findFirstByIsDefaultTrue();

    @Modifying
    @Query(
        "UPDATE BannerImage bi " +
        "SET bi.isDefault = CASE WHEN bi.bannerImageId = :bannerImageId THEN true ELSE false END"
    )
    int makeDefault(@Param("bannerImageId") Integer bannerImageId);
}


package com.TechKun.dao;

import com.TechKun.dto.promotion_dtos.PromotionDetails;

import java.util.List;

public interface PromotionRepositoryExtension {
    List<PromotionDetails> findPromotionDetails();
}


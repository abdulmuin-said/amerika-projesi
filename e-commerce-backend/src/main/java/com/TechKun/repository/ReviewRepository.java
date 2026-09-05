package com.TechKun.repository;

import com.TechKun.dao.ReviewRepositoryExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Integer>, ReviewRepositoryExtension {
}

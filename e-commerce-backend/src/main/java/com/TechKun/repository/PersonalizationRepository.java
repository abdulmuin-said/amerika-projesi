package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Personalization;

public interface PersonalizationRepository extends JpaRepository<Personalization, Integer> {
}

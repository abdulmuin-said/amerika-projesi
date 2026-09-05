package com.TechKun.repository;

import com.TechKun.model.ProductAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnswerRepository extends JpaRepository<ProductAnswer, Integer> {

    @Query("SELECT a FROM ProductAnswer a JOIN FETCH a.user WHERE a.answerId = :answerId")
    Optional<ProductAnswer> findByIdWithUser(@Param("answerId") Integer answerId);
}

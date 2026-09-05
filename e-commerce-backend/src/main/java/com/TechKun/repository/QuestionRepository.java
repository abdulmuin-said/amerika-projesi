package com.TechKun.repository;

import com.TechKun.model.ProductAnswer;
import com.TechKun.model.ProductQuestion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<ProductQuestion, Integer> {

    @Query("SELECT q FROM ProductQuestion q JOIN FETCH q.user WHERE q.product.productId = :productId ORDER BY q.dateAsked DESC")
    List<ProductQuestion> findByProductId(@Param("productId") Integer productId, Pageable pageable);

    @Query("SELECT COUNT(q) FROM ProductQuestion q WHERE q.product.productId = :productId")
    long countByProductId(@Param("productId") Integer productId);

    @Query("SELECT a FROM ProductAnswer a JOIN FETCH a.user WHERE a.question.questionId IN :questionIds ORDER BY a.dateAnswered ASC")
    List<ProductAnswer> findAnswersByQuestionIds(@Param("questionIds") List<Integer> questionIds);
}

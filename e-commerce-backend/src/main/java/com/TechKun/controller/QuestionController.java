package com.TechKun.controller;

import com.TechKun.dto.qa_dtos.AnswerDTO;
import com.TechKun.dto.qa_dtos.QuestionDTO;
import com.TechKun.dto.qa_dtos.QuestionDetails;
import com.TechKun.model.ProductAnswer;
import com.TechKun.model.ProductQuestion;
import com.TechKun.model.ShopUser;
import com.TechKun.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<QuestionDetails>> getQuestions(
            @RequestParam Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(questionService.getQuestions(productId, page, size));
    }

    @PostMapping
    public ResponseEntity<ProductQuestion> postQuestion(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(questionService.postQuestion(loggedInUser, dto));
    }

    @PostMapping("/{questionId}/answers")
    public ResponseEntity<ProductAnswer> postAnswer(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer questionId,
            @RequestBody AnswerDTO dto) {
        return ResponseEntity.ok(questionService.postAnswer(loggedInUser, questionId, dto));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer questionId) {
        questionService.deleteQuestion(loggedInUser, questionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(
            @AuthenticationPrincipal ShopUser loggedInUser,
            @PathVariable Integer answerId) {
        questionService.deleteAnswer(loggedInUser, answerId);
        return ResponseEntity.noContent().build();
    }
}

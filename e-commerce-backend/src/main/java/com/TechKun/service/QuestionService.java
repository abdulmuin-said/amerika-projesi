package com.TechKun.service;

import com.TechKun.dto.qa_dtos.AnswerDTO;
import com.TechKun.dto.qa_dtos.QuestionDTO;
import com.TechKun.dto.qa_dtos.QuestionDetails;
import com.TechKun.model.Product;
import com.TechKun.model.ProductAnswer;
import com.TechKun.model.ProductQuestion;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.AnswerRepository;
import com.TechKun.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    public List<QuestionDetails> getQuestions(Integer productId, int page, int size) {
        List<ProductQuestion> questions = questionRepository.findByProductId(
                productId, PageRequest.of(page, size));

        if (questions.isEmpty()) return Collections.emptyList();

        List<Integer> questionIds = questions.stream()
                .map(ProductQuestion::getQuestionId)
                .toList();

        List<ProductAnswer> answers = questionRepository.findAnswersByQuestionIds(questionIds);

        Map<Integer, List<ProductAnswer>> answersByQuestionId = answers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getQuestionId()));

        long total = questionRepository.countByProductId(productId);

        return questions.stream().map(q -> {
            QuestionDetails dto = new QuestionDetails();
            dto.setQuestionId(q.getQuestionId());
            dto.setQuestionText(q.getQuestionText());
            dto.setDateAsked(q.getDateAsked());
            dto.setTotalQuestions((int) total);

            QuestionDetails.UserSummary userSummary = new QuestionDetails.UserSummary();
            userSummary.setUserId(q.getUser().getUserId());
            userSummary.setFullName(q.getUser().getFullName());
            dto.setUser(userSummary);

            List<QuestionDetails.AnswerDetails> answerDtos = answersByQuestionId
                    .getOrDefault(q.getQuestionId(), Collections.emptyList())
                    .stream().map(a -> {
                        QuestionDetails.AnswerDetails ad = new QuestionDetails.AnswerDetails();
                        ad.setAnswerId(a.getAnswerId());
                        ad.setAnswerText(a.getAnswerText());
                        ad.setDateAnswered(a.getDateAnswered());

                        QuestionDetails.UserSummary au = new QuestionDetails.UserSummary();
                        au.setUserId(a.getUser().getUserId());
                        au.setFullName(a.getUser().getFullName());
                        ad.setUser(au);
                        return ad;
                    }).toList();

            dto.setAnswers(answerDtos);
            return dto;
        }).toList();
    }

    public ProductQuestion postQuestion(ShopUser user, QuestionDTO dto) {
        Assert.hasText(dto.getQuestionText(), "Question text must not be empty.");
        Assert.notNull(dto.getProductId(), "Product ID must not be null.");

        ProductQuestion question = new ProductQuestion();
        question.setProduct(new Product(dto.getProductId()));
        question.setUser(user);
        question.setQuestionText(dto.getQuestionText());

        return questionRepository.save(question);
    }

    public ProductAnswer postAnswer(ShopUser user, Integer questionId, AnswerDTO dto) {
        Assert.hasText(dto.getAnswerText(), "Answer text must not be empty.");

        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found."));

        ProductAnswer answer = new ProductAnswer();
        answer.setQuestion(question);
        answer.setUser(user);
        answer.setAnswerText(dto.getAnswerText());

        return answerRepository.save(answer);
    }

    public void deleteQuestion(ShopUser user, Integer questionId) {
        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found."));

        if (!(user.getUserId().equals(question.getUser().getUserId()) || user.isAdmin()))
            throw new AccessDeniedException("You are not authorized to delete this question.");

        questionRepository.delete(question);
    }

    public void deleteAnswer(ShopUser user, Integer answerId) {
        ProductAnswer answer = answerRepository.findByIdWithUser(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found."));

        if (!(user.getUserId().equals(answer.getUser().getUserId()) || user.isAdmin()))
            throw new AccessDeniedException("You are not authorized to delete this answer.");

        answerRepository.delete(answer);
    }
}

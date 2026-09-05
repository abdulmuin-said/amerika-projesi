package com.TechKun.dto.qa_dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuestionDetails {
    private Integer questionId;
    private String questionText;
    private LocalDateTime dateAsked;
    private UserSummary user;
    private List<AnswerDetails> answers;
    private Integer totalQuestions;

    @Data
    public static class UserSummary {
        private Integer userId;
        private String fullName;
    }

    @Data
    public static class AnswerDetails {
        private Integer answerId;
        private String answerText;
        private LocalDateTime dateAnswered;
        private UserSummary user;
    }
}

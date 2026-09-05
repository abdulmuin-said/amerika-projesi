package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ProductAnswer")
public class ProductAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Integer answerId;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private ProductQuestion question;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private ShopUser user;

    @Column(name = "answer_text", nullable = false, length = 2000)
    private String answerText;

    @Column(name = "date_answered", nullable = false)
    private LocalDateTime dateAnswered;

    @PrePersist
    protected void onCreate() {
        dateAnswered = LocalDateTime.now();
    }
}

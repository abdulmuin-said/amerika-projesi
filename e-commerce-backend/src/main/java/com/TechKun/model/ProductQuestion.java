package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "ProductQuestion")
public class ProductQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Integer questionId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private ShopUser user;

    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;

    @Column(name = "date_asked", nullable = false)
    private LocalDateTime dateAsked;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductAnswer> answers;

    @PrePersist
    protected void onCreate() {
        dateAsked = LocalDateTime.now();
    }
}

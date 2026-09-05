package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Personalization")
public class Personalization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "personalization_id", nullable = false)
    private Integer personalizationId;

    @Column(name = "personalization_text",  nullable = false)
    private String personalizationText;

    @Column(name = "attached_image_url", nullable = true)
    private String attachedImageUrl;

    public Personalization(Integer personalizationId) {
        this.personalizationId = personalizationId;
    }
}
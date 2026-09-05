package com.TechKun.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "VariationOption")
public class  VariationOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variation_option_id", nullable = false)
    private Integer variationOptionId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "variation_id", nullable = false)
    private Variation variation;

    public VariationOption(Integer variationOptionId) {
        this.variationOptionId = variationOptionId;
    }
}

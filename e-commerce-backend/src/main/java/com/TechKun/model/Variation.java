package com.TechKun.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Variation")
public class Variation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variation_id", nullable = false)
    private Integer variationId;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "variation", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<VariationOption> variationOptions;

    public Variation(Integer variationId) {
        this.variationId = variationId;
    }
}

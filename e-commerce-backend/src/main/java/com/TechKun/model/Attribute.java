package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Attribute")
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attribute_id", nullable = false)
    private Integer attributeId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AttributeType type;

    @Column(name = "allowed_values", columnDefinition = "TEXT[]")
    private List<String> allowedValues;

    public Attribute(Integer attributeId) {
        this.attributeId = attributeId;
    }

    public enum AttributeType {
        ENUMERATED, CUSTOM
    }
}
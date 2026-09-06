package com.TechKun.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "name_tr")
    private String nameTr;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parentCategory;

    @ManyToMany()
    @JoinTable(name = "category_variation",
        joinColumns = @JoinColumn(name = "category_id"),
        inverseJoinColumns = @JoinColumn(name = "variation_id")
    )
    private List<Variation> variations;

    @ManyToMany()
    @JoinTable(name = "category_attribute",
        joinColumns = @JoinColumn(name = "category_id"),
        inverseJoinColumns = @JoinColumn(name = "attribute_id")
    )
    private List<Attribute> attributes;

    public Category(Integer categoryId) {
        this.categoryId = categoryId;
    }
}

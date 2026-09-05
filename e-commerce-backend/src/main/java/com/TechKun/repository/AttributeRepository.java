package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.Attribute;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    @Modifying
    @Query(value = "DELETE FROM category_attribute WHERE attribute_id = :attributeId", nativeQuery = true)
    void deleteCategoryAttributesByAttributeId(@Param("attributeId") Integer attributeId);
}

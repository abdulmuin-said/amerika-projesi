package com.TechKun.dto.attribute_dtos;

import java.util.List;

import com.TechKun.model.Attribute;
import lombok.Data;

@Data
public class AttributeDTO {
    // private String attributeId;
    private String name;
    private Attribute.AttributeType type;
    private List<String> allowedValues;
}
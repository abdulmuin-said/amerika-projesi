package com.TechKun.service;

import java.util.List;

import com.TechKun.repository.AttributeRepository;
import com.TechKun.repository.ProductAttributeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.TechKun.model.*;
import com.TechKun.dto.attribute_dtos.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

@Service
public class AttributeService {
    @Autowired
    private AttributeRepository attributeRepository;
    @Autowired
    private ProductAttributeRepository productAttributeRepository;

    public List<Attribute> getAllAttributes() {
        return this.attributeRepository.findAll();
    }

    public Attribute createAttribute(
            AttributeDTO attributeDTO) {
        Assert.hasText(attributeDTO.getName(), "Attribute name must not be empty.");
        Assert.isTrue(attributeDTO.getType() != null, "Attribute type must not be empty.");
        if (attributeDTO.getType().equals(Attribute.AttributeType.ENUMERATED)) {
            Assert.isTrue(
                    !(attributeDTO.getAllowedValues() == null || attributeDTO.getAllowedValues().isEmpty()),
                    "An enumerated attribute's allowed values must not be empty.");
            attributeDTO.getAllowedValues()
                    .forEach(v -> Assert.hasText(v, "An enumerated attribute's allowed values must not be empty."));
        }

        Attribute attribute = new Attribute();
        attribute.setName(attributeDTO.getName());
        attribute.setType(attributeDTO.getType());
        attribute.setAllowedValues(attributeDTO.getAllowedValues());

        return this.attributeRepository.save(attribute);
    }

    @Transactional
    public Attribute updateAttribute(
            Integer attributeId,
            AttributeDTO attributeDTO) {
        boolean updateName = StringUtils.hasText(attributeDTO.getName());
        boolean updateType = attributeDTO.getType() != null;
        boolean updateAllowedValues = attributeDTO.getAllowedValues() != null;
        if (!(updateName || updateType || updateAllowedValues))
            throw new IllegalStateException("At least one field must be provided for update.");

        Attribute attribute = this.attributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found."));
        if (updateName)
            attribute.setName(attributeDTO.getName());
        if (updateType)
            attribute.setType(attributeDTO.getType());
        if (updateAllowedValues)
            attribute.setAllowedValues(attributeDTO.getAllowedValues());

        this.productAttributeRepository.resetAllAttributesByAttributeId(attributeId);
        return this.attributeRepository.save(attribute);
    }

//    @Transactional
//    public void deleteAttribute(
//            Integer attributeId) {
//        this.attributeRepository.deleteCategoryAttributesByAttributeId(attributeId);
//        this.productAttributeRepository.deleteByAttribute_AttributeId(attributeId);
//        this.attributeRepository.deleteById(attributeId);
//    }

    @Transactional
    public void deleteAttribute(Integer attributeId) {
        long count = productAttributeRepository.countOrdersUsingAttribute(attributeId);
        if (count > 0) {
            throw new RuntimeException("Cannot delete attribute. It is used in existing orders.");
        }

        this.attributeRepository.deleteCategoryAttributesByAttributeId(attributeId);
        this.productAttributeRepository.deleteByAttribute_AttributeId(attributeId);
        this.attributeRepository.deleteById(attributeId);
    }

}

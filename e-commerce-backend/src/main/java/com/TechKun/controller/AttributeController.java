package com.TechKun.controller;

import com.TechKun.service.AttributeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.TechKun.dto.attribute_dtos.AttributeDTO;
import com.TechKun.model.Attribute;

import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/attributes")
public class AttributeController {

    @Autowired
    private AttributeService attributeService;

    @GetMapping
    public ResponseEntity<List<Attribute>> getAllAttributes() {
        List<Attribute> attributes = attributeService.getAllAttributes();
        return ResponseEntity.ok(attributes);
    }

    @PostMapping
    public ResponseEntity<Attribute> createAttribute(
        @RequestBody AttributeDTO attributeDTO
    ) {
        Attribute attribute = attributeService.createAttribute(attributeDTO);
        return ResponseEntity.ok(attribute);
    }

    @PutMapping("/{attributeId}")
    public ResponseEntity<Attribute> updateAttribute(
        @PathVariable Integer attributeId,
        @RequestBody AttributeDTO attributeDTO
    ) {
        Attribute updatedAttribute = attributeService.updateAttribute(attributeId, attributeDTO);
        return ResponseEntity.ok(updatedAttribute);
    }

    @DeleteMapping("/{attributeId}")
    public ResponseEntity<Void> deleteAttribute(
        @PathVariable Integer attributeId
    ) {
        attributeService.deleteAttribute(attributeId);
        return ResponseEntity.noContent().build();
    }
}

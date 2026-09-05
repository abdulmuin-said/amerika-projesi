package com.TechKun.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import com.TechKun.dto.variation_dtos.VariationDTO;
import com.TechKun.model.Variation;
import com.TechKun.model.VariationOption;
import com.TechKun.repository.VariationRepository;

@Service
public class VariationService {
    @Autowired
    private VariationRepository variationRepository;

    public List<Variation> getAllVariations(Integer categoryId) {
        return this.variationRepository.findVariationsByCategoryId(categoryId);
    }
    public Variation createVariation(
        VariationDTO variationDTO
    ) {
        Assert.hasText(variationDTO.getName(), "Name must not be empty.");
        Assert.notEmpty(variationDTO.getVariationOptions(), "Variation options must not be empty.");
        variationDTO.getVariationOptions()
            .forEach(vo -> {
                Assert.notNull(vo, "A variation option must not be null.");
                Assert.hasText(vo.getName(), "A variation option's name must not be empty.");
                Assert.hasText(vo.getCode(), "A variation option's code must not be empty.");
            });
        Variation variation = new Variation();
        variation.setName(variationDTO.getName());
        variation.setVariationOptions(variationDTO.getVariationOptions()
            .stream()
            .map(vo -> {
                VariationOption variationOption = new VariationOption();
                variationOption.setName(vo.getName());
                variationOption.setCode(vo.getCode());
                variationOption.setVariation(variation);
                return variationOption;
            })
            .collect(Collectors.toList())
        );
        return this.variationRepository.save(variation);
    }
    public Variation updateVariation(
        Integer variationId,
        VariationDTO variationDTO
    ) {
        if (variationDTO.getVariationOptions() != null) {
            Assert.notEmpty(variationDTO.getVariationOptions(), "Variations options must not be empty.");
            variationDTO.getVariationOptions()
                .forEach(vo -> {
                    Assert.notNull(vo, "A variation option must not be null.");
                    Assert.hasText(vo.getName(), "A variation option's name must not be empty.");
                    Assert.hasText(vo.getCode(), "A variation option's code must not be empty.");
                });
        }

        boolean updateName = StringUtils.hasText(variationDTO.getName());
        boolean updateVariationOptions = variationDTO.getVariationOptions() != null;
        if (!(updateName || updateVariationOptions))
            throw new IllegalArgumentException("At least one field must be provided for update.");
        Variation variation = this.variationRepository.findById(variationId)
           .orElseThrow(() -> new IllegalArgumentException("Variation not found."));
        if (updateName)
            variation.setName(variationDTO.getName());
        if (updateVariationOptions) {
            Map<String, VariationOption> indexedVariationOptions = variation.getVariationOptions()
                .stream()
                .collect(Collectors.toMap(
                    VariationOption::getCode,
                    opt -> opt
                ));
            variationDTO.getVariationOptions().forEach(opt -> {
                VariationOption variationOption = indexedVariationOptions.remove(opt.getCode());
                if (variationOption == null) {
                    variation.getVariationOptions().add(variationOption = new VariationOption());
                    variationOption.setVariation(variation);
                    variationOption.setCode(opt.getCode());
                }

                variationOption.setName(opt.getName());
            });
            indexedVariationOptions.values().forEach(variation.getVariationOptions()::remove);
        }
        return this.variationRepository.save(variation);
    }
//    public void deleteVariation(
//        Integer variationId
//    ) {
//        this.variationRepository.deleteById(variationId);
//    }

    public void deleteVariation(Integer variationId) {
        long orderCount = variationRepository.countOrdersUsingVariation(variationId);
        if (orderCount > 0) {
            throw new RuntimeException("Cannot delete variation. It is used in existing orders.");
        }
        variationRepository.deleteById(variationId);
    }


}

import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Variation, VariationCreationPayload, VariationUpdationPayload } from "@/types/domains/variation";

const API_BASE_URL = '/variations';

export const getAllVariations: ServiceFunction<[categoryId?: number], Variation[]> = (categoryId) => {
    return servicesApiClient.get(`${API_BASE_URL}`, {
        params: { categoryId }
    });
};

export const createVariation: ServiceFunction<[variationDTO: VariationCreationPayload], Variation> = (variationDTO) => {
    return servicesApiClient.post(`${API_BASE_URL}`, { data: variationDTO });
};

export const updateVariation: ServiceFunction<[variationId: number, variationDTO: VariationUpdationPayload], Variation> = (variationId, variationDTO) => {
    return servicesApiClient.put(`${API_BASE_URL}/${variationId}`, { data: variationDTO });
};

export const deleteVariation: ServiceFunction<[variationId: number], void> = (variationId) => {
    return servicesApiClient.delete(`${API_BASE_URL}/${variationId}`);
};
import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Attribute, AttributeDTO } from "@/types/domains/attribute";

export const getAllAttributes: ServiceFunction<[], Attribute[]> = () => {
    return servicesApiClient.get('/attributes');
};

export const createAttribute: ServiceFunction<AttributeDTO, Attribute> = (payload) => {
    return servicesApiClient.post('/attributes', { data: payload });
};

export const updateAttribute: ServiceFunction<[attributeId: number, payload: AttributeDTO], Attribute> = (attributeId, payload) => {
    return servicesApiClient.put(`/attributes/${attributeId}`, { data: payload });
};

export const deleteAttribute: ServiceFunction<number, void> = (attributeId) => {
    return servicesApiClient.delete(`/attributes/${attributeId}`);
};
import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Promotion, PromotionDetails, PromotionDTO } from "@/types/domains/promotion";

export const getAllPromotions: ServiceFunction<[], PromotionDetails[]> = () => {
    return servicesApiClient.get('/promotions');
};

export const createPromotion: ServiceFunction<PromotionDTO, Promotion> = (promotionDTO) => {
    return servicesApiClient.post('/promotions', { data: promotionDTO });
};

export const updatePromotion: ServiceFunction<[promotionId: number, promotionDTO: PromotionDTO], Promotion> = (promotionId, promotionDTO) => {
    return servicesApiClient.put(`/promotions/${promotionId}`, { data: promotionDTO });
};

export const deletePromotion: ServiceFunction<[promotionId: number], void> = (promotionId) => {
    return servicesApiClient.delete(`/promotions/${promotionId}`);
};
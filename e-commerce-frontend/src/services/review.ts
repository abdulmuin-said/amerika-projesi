import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Review, ReviewDetails, ReviewDTO } from "@/types/domains/review";

export const getReviews: ServiceFunction<[
    productId?: number, customerId?: number,
    page?: number, size?: number, sort?: string
], ReviewDetails[]> = (productId, customerId, page, size, sort) => {
    return servicesApiClient.get(
        `/reviews`,
        { params: { productId, customerId, page, size, sort } }
    );
};

export const postReview: ServiceFunction<ReviewDTO, Review> = (reviewDTO) => {
    return servicesApiClient.post('/reviews', { data: reviewDTO });
};

export const editReview: ServiceFunction<[reviewId: number, reviewDTO: ReviewDTO], Review> = (reviewId, reviewDTO) => {
    return servicesApiClient.put(`/reviews/${reviewId}`, { data: reviewDTO });
};

export const deleteReview: ServiceFunction<[reviewId: number], void> = (reviewId) => {
    return servicesApiClient.delete(`/reviews/${reviewId}`);
};

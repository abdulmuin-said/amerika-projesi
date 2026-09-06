import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Review, ReviewDetails, ReviewDTO } from "@/types/domains/review";

export const getReviews: ServiceFunction<[
    productId?: number, customerId?: number,
    page?: number, size?: number, sort?: string,
    approvedOnly?: boolean
], ReviewDetails[]> = (productId, customerId, page, size, sort, approvedOnly) => {
    return servicesApiClient.get(
        `/reviews`,
        { params: { productId, customerId, page, size, sort, approvedOnly } }
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

export const toggleReviewApproval: ServiceFunction<[reviewId: number], Review> = (reviewId) => {
    return servicesApiClient.patch(`/reviews/${reviewId}/toggle-approval`);
};

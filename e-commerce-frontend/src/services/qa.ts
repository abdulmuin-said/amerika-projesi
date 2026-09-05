import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { AnswerDTO, QuestionDetails, QuestionDTO } from "@/types/domains/qa";

export const getQuestions: ServiceFunction<[
    productId: number, page?: number, size?: number
], QuestionDetails[]> = (productId, page = 0, size = 5) => {
    return servicesApiClient.get(`/questions`, { params: { productId, page, size } });
};

export const postQuestion: ServiceFunction<QuestionDTO, unknown> = (dto) => {
    return servicesApiClient.post(`/questions`, { data: dto });
};

export const postAnswer: ServiceFunction<[questionId: number, dto: AnswerDTO], unknown> = (questionId, dto) => {
    return servicesApiClient.post(`/questions/${questionId}/answers`, { data: dto });
};

export const deleteQuestion: ServiceFunction<[questionId: number], void> = (questionId) => {
    return servicesApiClient.delete(`/questions/${questionId}`);
};

export const deleteAnswer: ServiceFunction<[answerId: number], void> = (answerId) => {
    return servicesApiClient.delete(`/questions/answers/${answerId}`);
};

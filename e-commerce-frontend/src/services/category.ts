import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Category, CategoryDetails, CategoryDTO, CategoryTree } from "@/types/domains/category";

export const createCategory: ServiceFunction<CategoryDTO, Category> = (payload) => {
    return servicesApiClient.post('/categories', { data: payload });
};

export const updateCategory: ServiceFunction<[categoryId: number, payload: Partial<CategoryDTO>], Category> = (categoryId, payload) => {
    return servicesApiClient.put(`/categories/${categoryId}`, { data: payload });
};

export const getAllCategories: ServiceFunction<[], CategoryTree[]> = () => {
    return servicesApiClient.get('/categories');
};

export const getCategoryById: ServiceFunction<[categoryId: number], CategoryDetails> = (categoryId) => {
    return servicesApiClient.get(`/categories/${categoryId}`);
};

export const deleteCategory: ServiceFunction<[categoryId: number], void> = (categoryId) => {
    return servicesApiClient.delete(`/categories/${categoryId}`);
};
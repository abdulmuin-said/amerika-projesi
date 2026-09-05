import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import {
    Product, ProductDetails, ProductImage,
    ProductPatchPayload, ProductPayload,
    ProductPreview, ProductQueryOptions
} from "@/types/domains/product";

export const getAllProducts: ServiceFunction<ProductQueryOptions, ProductPreview[]> = (filters) => {
    return servicesApiClient.get('/products', { data: filters });
};

export const getProductById: ServiceFunction<[productId: number], ProductDetails> = (productId) => {
    return servicesApiClient.get(`/products/${productId}`);
};

export const createProduct: ServiceFunction<ProductPayload, Product> = (productDto) => {
    return servicesApiClient.post('/products', { data: productDto });
};

export const updateProduct: ServiceFunction<[productId: number, productDto: Partial<ProductPayload>], Product> = (productId, productDto) => {
    return servicesApiClient.put(`/products/${productId}`, { data: productDto });
};

export const updateProductBasicDetails: ServiceFunction<[productId: number, updateDto: ProductPatchPayload], ProductPatchPayload> = (productId, updateDto) => {
    return servicesApiClient.patch(`/products/${productId}`, { data: updateDto });
};

export const addProductImage: ServiceFunction<[
    productId: number,
    imageUrl: string,
    isDefault?: boolean
], ProductImage> = (productId, imageUrl, isDefault = false) => {
    return servicesApiClient.post(`/products/${productId}/images`, { params: { imageUrl, isDefault } });
};

export const selectDefaultProductImage: ServiceFunction<[
    productId: number,
    productImageId: number
], void> = (productId, productImageId) => {
    return servicesApiClient.put(`/products/${productId}/images/${productImageId}`);
};

export const removeProductImage: ServiceFunction<[
    productImageId: number
], void> = (productImageId) => {
    return servicesApiClient.delete(`/images/${productImageId}`);
};

export const deleteProduct: ServiceFunction<[
    productId: number
], void> = (productId) => {
    return servicesApiClient.delete(`/products/${productId}`);
};

export const bulkDeleteProducts: ServiceFunction<
    [ids: number[]],
    { deleted: number[]; failed: { productId: number; reason: string }[] }
> = (ids) => {
    return servicesApiClient.delete('/products/bulk', { data: ids });
};

export const bulkUpdateProductStatus: ServiceFunction<
    [ids: number[], status: boolean],
    void
> = (ids, status) => {
    return servicesApiClient.patch('/products/bulk/status', { data: { productIds: ids, status } });
};

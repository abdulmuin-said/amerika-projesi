import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { ShopUser, UserQueryOptions, UserUpdatePayload } from "@/types/domains/user";

export const getAllUsers: ServiceFunction<UserQueryOptions, ShopUser[]> = (userQueryOptions) => {
    return servicesApiClient.get('/users', { data: userQueryOptions });
};

export const updateUser: ServiceFunction<UserUpdatePayload, ShopUser> = (payload) => {
    return servicesApiClient.put('/users', { data: payload });
};

export const removeUser: ServiceFunction<[userId: number], void> = (userId) => {
    return servicesApiClient.delete(`/users/${userId}`);
};
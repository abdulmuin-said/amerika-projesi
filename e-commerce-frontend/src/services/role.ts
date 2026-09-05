import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { Role } from "@/types/domains/user";

export const getAllRoles: ServiceFunction<[], Role[]> = () => {
    return servicesApiClient.get('/roles');
};

export const getRoleById: ServiceFunction<[roleId: number], Role> = (roleId) => {
    return servicesApiClient.get(`/roles/${roleId}`);
};

export const createRole: ServiceFunction<Role, Role> = (role) => {
    return servicesApiClient.post('/roles', { data: role });
};

export const updateRole: ServiceFunction<[roleId: number, role: Role], Role> = (roleId, role) => {
    return servicesApiClient.put(`/roles/${roleId}`, { data: role });
};

export const deleteRole: ServiceFunction<[roleId: number], void> = (roleId) => {
    return servicesApiClient.delete(`/roles/${roleId}`);
};
import { Address, AddressDTO } from "./address";

export interface UserQueryOptions {
    fullName?: string;
    phoneNo?: string;
    email?: string;
    city?: string;
    country?: string;
}

export interface UserUpdatePayload {
    fullName?: string;
    address?: AddressDTO;
}

export interface CustomerContact {
    customerId: number;
    customerName: string;
    phoneNumber: string;
    email: string;
}

export interface Role {
    roleId: number;
    name: UserRole;
}

export enum UserRole {
    PLATFORM_ADMIN = "PLATFORM_ADMIN",
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER"
}

export interface ShopUser {
    userId: number;
    password: string;
    fullName: string;
    email: string;
    phoneNo: string;
    address: Address;
    role: Role;
    joinedAt: Date;
    removed: boolean;
}

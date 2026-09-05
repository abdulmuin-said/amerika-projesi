import { Address, AddressDTO } from "./address";
import { UserRole } from "./user";

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteAccountPayload {
    password: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegistrationPayload {
    email: string;
    password: string;
    fullName: string;
    phoneNo: string;
    address: AddressDTO;
    roleId: number;
}

export interface ResetPasswordPayload {
    token: string;
    newPassword: string;
}

export interface TokenPayload {
    message: string;
    token: string;
    expiresAt: number;
    user: UserEssentials;
}

export interface UserEssentials {
    userId: number;
    fullName: string;
    email: string;
    phoneNo: string;
    address: Address;
    roleId: number;
    roleName: UserRole;
    joinedAt: Date;
}
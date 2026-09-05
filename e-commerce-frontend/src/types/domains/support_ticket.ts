import { CustomerContact, ShopUser } from "./user";

export interface SupportTicket {
    ticketId: number;
    subject: string;
    description: string;
    status: string;
    customer: ShopUser;
    createdAt: Date;
}

export interface SupportTicketDTO {
    subject: string;
    description: string;
    status: string;
}

export interface SupportTicketDetails {
    ticketId: number;
    subject: string;
    description: string;
    status: string;
    customer: CustomerContact;
}

export interface SupportTicketQueryOptions {
    status: string;
    customerName: string;
    fromDate: Date;
    toDate: Date;
}
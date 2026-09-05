import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import {
    SupportTicket, SupportTicketDetails,
    SupportTicketDTO, SupportTicketQueryOptions
} from "@/types/domains/support_ticket";

export const createSupportTicket: ServiceFunction<SupportTicketDTO, SupportTicket> = (supportTicketDto) => {
    return servicesApiClient.post('/support-tickets', { data: supportTicketDto });
};

export const updateSupportTicket: ServiceFunction<[supportTicketId: number, status: string], SupportTicket> = (supportTicketId, status) => {
    return servicesApiClient.put(`/support-tickets/${supportTicketId}`, { data: { status } });
};

export const getAllSupportTickets: ServiceFunction<[
    customerId?: number, queryOptions?: SupportTicketQueryOptions
], SupportTicketDetails[]> = (customerId, queryOptions) => {
    return servicesApiClient.get('/support-tickets', { params: { customerId }, data: queryOptions });
};
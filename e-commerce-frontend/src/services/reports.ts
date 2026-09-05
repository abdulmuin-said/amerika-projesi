import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { CategoriesPerformanceResponse, CustomersReportResponse, DateRange, DiscountsPerformanceResponse, OrdersReportResponse, ProductsPerformanceResponse, SalesReportResponse } from "@/types/domains/reports";
import { format } from "date-fns";
// API Service Functions
export const getSalesReport: ServiceFunction<DateRange, SalesReportResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/sales', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};

export const getCategoriesPerformanceReport: ServiceFunction<DateRange, CategoriesPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/categories-performance', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};

export const getOrdersReport: ServiceFunction<DateRange, OrdersReportResponse[]> = (dateRange) => {
    return servicesApiClient.get('/reports/orders', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};

export const getCustomersReport: ServiceFunction<DateRange, CustomersReportResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/customers', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};

export const getProductsPerformanceReport: ServiceFunction<DateRange, ProductsPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/products-performance', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};

export const getDiscountsPerformanceReport: ServiceFunction<DateRange, DiscountsPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/discounts-performance', { 
        params: { 
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        } 
    });
};
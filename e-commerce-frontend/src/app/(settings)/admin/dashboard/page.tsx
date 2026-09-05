/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
} from "lucide-react";

import { subDays, format } from "date-fns";
import { TopCustomersTable } from "./components/TopCustomersTable";
import { DiscountsTable } from "./components/DiscountTable";
import { OrdersChart } from "./components/OrderChart";
import { SalesChart } from "./components/SalesChart";
import { MetricCard } from "./components/MatricCard";
import { DateRangeSelector } from "./components/DateRangeSelector";
import useDataFetch from "@/hooks/use-data-fetch";
import * as reportServices from "@/services/reports";
import { CustomersReportResponse, DiscountsPerformanceResponse, OrdersReportResponse, ProductsPerformanceResponse, SalesReportResponse } from "@/types/domains/reports";



export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const salesData = useDataFetch(reportServices.getSalesReport);
  const customersData = useDataFetch(reportServices.getCustomersReport);
  const ordersData = useDataFetch(reportServices.getOrdersReport);
  const productsData = useDataFetch(reportServices.getProductsPerformanceReport);
  const discountsData = useDataFetch(reportServices.getDiscountsPerformanceReport);

  useEffect(() => {
    const dateRangeArgument = {
      startDate: dateRange.from,
      endDate: dateRange.to
    };

    salesData.request(dateRangeArgument)
      .onSuccess((data: SalesReportResponse) => {
        console.log('Sales data loaded:', data);
      })
      .onError((error) => {
        console.error('Sales data error:', error);
      });

    customersData.request(dateRangeArgument)
      .onSuccess((data: CustomersReportResponse) => {
        console.log('Customers data loaded:', data);
      })
      .onError((error) => {
        console.error('Customers data error:', error);
      });

    ordersData.request(dateRangeArgument)
      .onSuccess((data: OrdersReportResponse[]) => {
        console.log('Orders data loaded:', data);
      })
      .onError((error) => {
        console.error('Orders data error:', error);
      });

    productsData.request(dateRangeArgument)
      .onSuccess((data: ProductsPerformanceResponse) => {
        console.log('Products data loaded:', data);
      })
      .onError((error) => {
        console.error('Products data error:', error);
      });

    discountsData.request(dateRangeArgument)
      .onSuccess((data: DiscountsPerformanceResponse) => {
        console.log('Discounts data loaded:', data);
      })
      .onError((error) => {
        console.error('Discounts data error:', error);
      });

  }, [dateRange]);
 
  const isLoading = salesData.isLoading || customersData.isLoading || ordersData.isLoading || productsData.isLoading || discountsData.isLoading;

  const hasError = salesData.hasError || customersData.hasError || ordersData.hasError || productsData.hasError || discountsData.hasError;


  if (isLoading && !salesData.data && !customersData.data) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (hasError && !salesData.data && !customersData.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">Failed to fetch dashboard data</p>
          <button 
            onClick={() => {
              const dateRangeArgument = {
                startDate: dateRange.from,
                endDate: dateRange.to
              };
              salesData.request(dateRangeArgument);
              customersData.request(dateRangeArgument);
              ordersData.request(dateRangeArgument);
              productsData.request(dateRangeArgument);
              discountsData.request(dateRangeArgument);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
            {isLoading && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></span>
                Updating data...
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <DateRangeSelector 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange} 
            />
          </div>
        </div>

    
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Sales"
            value={`${salesData.data?.totalSales?.toLocaleString() || '0'}`}
            change={12.5} // You might want to calculate this from historical data
            icon={<DollarSign className="h-5 w-5" />}
            iconColor="bg-orange-100 text-orange-600"
            isLoading={salesData.isLoading}
          />
          <MetricCard
            title="Total Orders"
            value={salesData.data?.totalOrders?.toLocaleString() || '0'}
            change={8.2}
            icon={<ShoppingCart className="h-5 w-5" />}
            iconColor="bg-blue-100 text-blue-600"
            isLoading={salesData.isLoading}
          />
          <MetricCard
            title="New Customers"
            value={customersData.data?.customersOnboarded?.toLocaleString() || '0'}
            change={15.8}
            icon={<Users className="h-5 w-5" />}
            iconColor="bg-green-100 text-green-600"
            isLoading={customersData.isLoading}
          />
          <MetricCard
            title="Total Purchases"
            value={productsData.data?.totalPurchases?.toLocaleString() || '0'}
            change={-19}
            icon={<Package className="h-5 w-5" />}
            iconColor="bg-purple-100 text-purple-600"
            isLoading={productsData.isLoading}
          />
        </div>

   
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart 
            data={salesData.data?.salesByPeriod || []} 
            isLoading={salesData.isLoading}
          />
          <OrdersChart 
            data={ordersData.data || []} 
            isLoading={ordersData.isLoading}
          />
        </div>

   
        <div className="grid gap-6 lg:grid-cols-2">
          <TopCustomersTable 
            customers={customersData.data?.topCustomers || []} 
            isLoading={customersData.isLoading}
          />
          <DiscountsTable 
            discounts={discountsData.data?.discounts || []} 
            isLoading={discountsData.isLoading}
          />
        </div>

    
        {isLoading && (salesData.data || customersData.data) && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Refreshing data...</span>
          </div>
        )}
      </div>
    </div>
  );
}
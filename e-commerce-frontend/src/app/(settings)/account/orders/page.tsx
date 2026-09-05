/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import OrderList from "@/app/orders/components/OrderList";
import useDataFetch from "@/hooks/use-data-fetch";
import { getAllOrders } from "@/services/shopOrder";
import { OrderPreviewDTO } from "@/types/domains/order";
import { PageResponse } from "@/types/api";
import { Package, Loader2 } from "lucide-react";

export default function OrderHistory() {
    const orders = useDataFetch<[customerId?: number, filters?: any, page?: number, size?: number], PageResponse<OrderPreviewDTO>>(getAllOrders);

    useEffect(() => {
        orders.request();
    }, []);

    if (orders.isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center">
                    <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 text-lg">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (orders.hasError) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center">
                    <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-xl border border-red-200">
                    <Package className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600 text-lg font-medium mb-2">Error loading orders</p>
                    <p className="text-gray-600 text-sm">Please try again later</p>
                </div>
            </div>
        );
    }

    // Extract content array from paginated response
    const ordersArray = orders.data?.content && Array.isArray(orders.data.content) ? orders.data.content : [];

    if (ordersArray.length === 0) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center">
                    <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <OrderList orders={[]} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                    <p className="text-gray-600 mt-1">View and manage all your orders</p>
                </div>
                <div className="text-sm text-gray-500">
                    {ordersArray.length} {ordersArray.length === 1 ? 'order' : 'orders'}
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6">
                    <OrderList orders={ordersArray} />
                </div>
            </div>
        </div>
    );
}
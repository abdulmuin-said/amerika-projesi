"use client";

import React from "react";
import { use } from "react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as orderServices from "@/services/shopOrder";
import { OrderDetails } from "@/types/domains/order";
import OrderDetailView from "../components/OrderDetails";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const OrderDetailsPage = ({ params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = use(params);
    const router = useRouter();
    const getOrderFetch = useDataFetch(orderServices.getOrderById);
    const [order, setOrder] = useState<OrderDetails | null>(null);

    useEffect(() => {
        if (orderId) {
            getOrderFetch.request(Number(orderId)).onSuccess((data: OrderDetails) => {
                setOrder(data);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    if (getOrderFetch.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (getOrderFetch.hasError || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">We could not find order #{orderId}.</p>
                    <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
                </div>
            </div>
        );
    }

    return <OrderDetailView order={order} />;
};

export default OrderDetailsPage;

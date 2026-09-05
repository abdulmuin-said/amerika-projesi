"use client";
import React, { useEffect } from 'react';
import OrderList from './components/OrderList';
import useDataFetch from '@/hooks/use-data-fetch';
import * as orderServices from '@/services/shopOrder';
import { OrderPreviewDTO } from '@/types/domains/order';

export default function OrdersPage() {
    const ordersData = useDataFetch(orderServices.getAllOrders);

    useEffect(() => {
        ordersData.request();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <OrderList orders={(ordersData.data as {content?: OrderPreviewDTO[]})?.content ?? (ordersData.data as unknown as OrderPreviewDTO[]) ?? []} />
        </div>
    );
}
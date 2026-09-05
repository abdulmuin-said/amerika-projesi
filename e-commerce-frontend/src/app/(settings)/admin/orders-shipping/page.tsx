/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useRef, useState } from 'react'
import * as orderServices from "@/services/shopOrder";
import useDataFetch from '@/hooks/use-data-fetch';
import { OrderPreviewDTO, OrderStatus, OrderUpdatePayload } from '@/types/domains/order';
import { PageResponse } from '@/types/api';
import OrdersTable from './components/OrdersTable';
import ViewOrders from './components/ViewOrders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogRef } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OrdersShippingPage() {
    const ordersData = useDataFetch<[
        customerId?: number, filters?: any,
        page?: number, size?: number
    ], PageResponse<OrderPreviewDTO>>(orderServices.getAllOrders);

    const updateOrderData = useDataFetch(orderServices.updateOrder);

    const editOrderRef = useRef<DialogRef>(null);
    const viewOrderRef = useRef<DialogRef>(null);

    const [selectedOrder, setSelectedOrder] = useState<OrderPreviewDTO | null>(null);
    const [viewOrderId, setViewOrderId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 20;

    const fetchOrders = (page = 0) => {
        ordersData.request(undefined, undefined, page, PAGE_SIZE);
    };

    useEffect(() => {
        fetchOrders(0);
    }, []);

    const handleEditOrder = (order: OrderPreviewDTO) => {
        setSelectedOrder(order);
        editOrderRef.current?.open();
    };


    const handleViewOrderDetails = (orderId: number) => {
        setViewOrderId(orderId);
        viewOrderRef.current?.open();
    };

    const orders: OrderPreviewDTO[] = ordersData.data?.content || [];
    const totalPages = ordersData.data?.totalPages ?? 1;
    const totalElements = ordersData.data?.totalElements ?? 0;


    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order &amp; Shipping</h1>
                        {!ordersData.isLoading && totalElements > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {totalElements} order{totalElements !== 1 ? 's' : ''} total
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => fetchOrders(currentPage)}
                        disabled={ordersData.isLoading}
                    >
                        {ordersData.isLoading ? 'Loading...' : 'Refresh'}
                    </Button>
                </div>

                {ordersData.hasError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800 mb-4">
                        Failed to load orders. Please try again.
                    </div>
                )}

                <OrdersTable
                    ordersData={orders}
                    isLoading={ordersData.isLoading}
                    onEdit={handleEditOrder}
                    onViewDetails={handleViewOrderDetails}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 0 || ordersData.isLoading}
                                onClick={() => {
                                    const prev = currentPage - 1;
                                    setCurrentPage(prev);
                                    fetchOrders(prev);
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages - 1 || ordersData.isLoading}
                                onClick={() => {
                                    const next = currentPage + 1;
                                    setCurrentPage(next);
                                    fetchOrders(next);
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Order Dialog */}
            <Dialog ref={editOrderRef}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Order #{selectedOrder?.orderId}</DialogTitle>
                        <DialogDescription>
                            Update the status for this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Customer: <span className="font-medium text-foreground">{selectedOrder?.customer?.customerName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Current Status: <span className="font-medium text-foreground">{String(selectedOrder?.status).replaceAll('_', ' ')}</span>
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Change Status:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(OrderStatus).map((status) => (
                                    <Button
                                        key={status}
                                        variant={selectedOrder?.status === status ? "default" : "outline"}
                                        size="sm"
                                        disabled={updateOrderData.isLoading}
                                        onClick={() => {
                                            if (!selectedOrder) return;
                                            updateOrderData
                                                .request(selectedOrder.orderId, { status } as OrderUpdatePayload)
                                                .onSuccess(() => {
                                                    toast.success(`Order status updated to ${status.replaceAll('_', ' ')}`);
                                                    fetchOrders(currentPage);
                                                    editOrderRef.current?.close();
                                                    setSelectedOrder(null);
                                                })
                                                .onError(() => {
                                                    toast.error('Failed to update order status');
                                                });
                                        }}
                                    >
                                        {status.replaceAll('_', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            editOrderRef.current?.close();
                            setSelectedOrder(null);
                        }}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* View Order Dialog */}
            <Dialog ref={viewOrderRef}>
                <DialogContent className="sm:max-w-[750px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="mb-2">
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Full details for the selected order.
                        </DialogDescription>
                    </DialogHeader>
                    <ViewOrders orderId={viewOrderId} />
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => {
                            viewOrderRef.current?.close();
                            setViewOrderId(null);
                        }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
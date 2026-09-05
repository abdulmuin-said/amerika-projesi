/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client"
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User, Calendar, Truck, CreditCard, MapPin,
    Package, Phone, Mail, Hash, Clock, AlertCircle, Loader2
} from "lucide-react";
import { OrderDetails, OrderStatus } from "@/types/domains/order";
import useDataFetch from "@/hooks/use-data-fetch";
import * as orderServices from "@/services/shopOrder";

interface ViewOrdersProps {
    orderId: number | null;
}

const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
        case OrderStatus.PENDING: return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case OrderStatus.CONFIRMED: return "bg-blue-100 text-blue-800 border-blue-300";
        case OrderStatus.PROCESSING: return "bg-purple-100 text-purple-800 border-purple-300";
        case OrderStatus.SHIPPED: return "bg-indigo-100 text-indigo-800 border-indigo-300";
        case OrderStatus.OUT_FOR_DELIVERY: return "bg-orange-100 text-orange-800 border-orange-300";
        case OrderStatus.DELIVERED: return "bg-green-100 text-green-800 border-green-300";
        case OrderStatus.CANCELLED: return "bg-red-100 text-red-800 border-red-300";
        case OrderStatus.RETURNED: return "bg-gray-100 text-gray-800 border-gray-300";
        case OrderStatus.REFUNDED: return "bg-pink-100 text-pink-800 border-pink-300";
        case OrderStatus.FAILED: return "bg-red-100 text-red-800 border-red-300";
        default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
};

const formatDate = (date: Date | string | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
    });
};

const formatStatus = (status: string) =>
    String(status).replaceAll("_", " ");

export default function ViewOrders({ orderId }: ViewOrdersProps) {
    const orderData = useDataFetch<[shopOrderId: number], OrderDetails>(orderServices.getOrderById);

    useEffect(() => {
        if (orderId != null) {
            orderData.request(orderId);
        }
    }, [orderId]);

    /* ---------- LOADING ---------- */
    if (orderData.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading order details…</p>
            </div>
        );
    }

    /* ---------- ERROR ---------- */
    if (orderData.hasError || !orderData.data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-sm text-red-500">Failed to load order details.</p>
            </div>
        );
    }

    const order = orderData.data;

    return (
        <div className="space-y-4">

            {/* ── Header bar ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold font-mono">Order #{order.shopOrderId}</span>
                </div>
                <Badge className={`${getStatusColor(order.orderStatus)} border text-xs font-semibold px-3 py-1`}>
                    {formatStatus(order.orderStatus)}
                </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ── Customer Info ── */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" /> Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                        <p className="font-medium text-base">{order.customer?.customerName ?? "—"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{order.customer?.email ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{order.customer?.phoneNumber ?? "—"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Dates ── */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Dates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Order Date</span>
                            <span className="font-medium">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Delivery</span>
                            <span className="font-medium">{formatDate(order.estimatedDeliveryDate)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Shipping Info ── */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4" /> Shipping
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {!order.shippingMethod && !order.shippingProvider && !order.carrierName && !order.trackingNumber ? (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                <Truck className="h-4 w-4 flex-shrink-0" />
                                <span>Shipping not yet assigned to this order</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="font-medium">{order.shippingMethod?.name ?? "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span className="font-medium">{order.shippingProvider ?? "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Carrier</span>
                                    <span className="font-medium">{order.carrierName ?? "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tracking #</span>
                                    <span className="font-medium font-mono">{order.trackingNumber ?? "—"}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Payment Info ── */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {!order.paymentMethod && !order.paymentProvider ? (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                <CreditCard className="h-4 w-4 flex-shrink-0" />
                                <span>Payment not yet assigned to this order</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium">{order.paymentMethod?.type ? formatStatus(order.paymentMethod.type) : "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Card Holder</span>
                                    <span className="font-medium">{order.paymentMethod?.cardHolderName ?? "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Last 4</span>
                                    <span className="font-medium font-mono">
                                        {order.paymentMethod?.last4 ? `•••• ${order.paymentMethod.last4}` : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Expiry</span>
                                    <span className="font-medium font-mono">
                                        {order.paymentMethod?.expiryMonth && order.paymentMethod?.expiryYear
                                            ? `${order.paymentMethod.expiryMonth}/${order.paymentMethod.expiryYear}`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span className="font-medium">{order.paymentProvider ?? "—"}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Shipping Address ── */}
                <Card className="border shadow-sm md:col-span-2">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Shipping Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {order.shippingAddress ? (
                            <p className="text-sm font-medium">
                                {order.shippingAddress.street},&nbsp;
                                {order.shippingAddress.city},&nbsp;
                                {order.shippingAddress.pincode},&nbsp;
                                {order.shippingAddress.country}
                            </p>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>Shipping address not yet assigned to this order</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* ── Order Items ── */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" /> Order Items ({order.orderItems?.length ?? 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                    {order.orderItems?.length ? (
                        order.orderItems.map((item, idx) => {
                            const sku = item.productVariant?.sku ?? item.productVariantId?.toString() ?? '—';
                            const itemShipping = (item as any).shippingMethod;
                            return (
                                <div
                                    key={item.orderItemId ?? idx}
                                    className="flex items-start justify-between bg-muted/40 rounded-md px-3 py-3 text-sm gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-semibold">{sku}</p>
                                            {itemShipping?.name && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />{itemShipping.name}
                                                </p>
                                            )}
                                            {item.personalization && (
                                                <p className="text-xs text-muted-foreground">
                                                    {JSON.stringify(item.personalization)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold">₹{item.price?.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                            <Clock className="h-3 w-3" /> Qty: {item.quantity}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Total: ₹{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No items found.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}

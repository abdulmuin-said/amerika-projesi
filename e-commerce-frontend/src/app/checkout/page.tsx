/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import useDataFetch from "@/hooks/use-data-fetch";
import * as stripeServices from "@/services/stripe";
import * as shippingServices from "@/services/shippingMethod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { toast } from "sonner";
import CheckoutForm, { CheckoutFormSubmitData } from "./components/CheckoutForm";
import { clearBuyNowItem } from "@/store/slices/buyNowSlice";
import { clearCart } from "@/store/slices/cartSlice";

const shippingMethodsMap: Record<number, ShippingMethod> = {};

function CheckoutPageInner() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get("mode") === "buynow";
    const paymentResult = searchParams.get("payment");

    const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
    const buyNowItem = useAppSelector((state) => state.buyNow.item);
    const { user } = useAppSelector((state) => state.auth);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (paymentResult === "failed") {
            const reason = searchParams.get("reason");
            const messages: Record<string, string> = {
                "card_declined": "Payment card was declined. Please try again with a valid card.",
                "confirmation_failed": "Payment could not be confirmed. Please contact concierge.",
                "server_error": "A payment processing error occurred. Please try again.",
            };
            toast.error(messages[reason ?? ""] ?? "Payment failed. Please try again.");
        }
    }, [paymentResult, searchParams]);

    useEffect(() => {
        if (!isBuyNow) dispatch(clearBuyNowItem());
    }, [isBuyNow, dispatch]);

    const effectiveItems = useMemo(
        () => (isBuyNow && buyNowItem ? [buyNowItem] : cartItems),
        [isBuyNow, buyNowItem, cartItems]
    );
    const effectiveTotal = useMemo(
        () => (isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalAmount),
        [isBuyNow, buyNowItem, totalAmount]
    );

    const createPaymentIntentFetch = useDataFetch(stripeServices.createPaymentIntent);
    const confirmPaymentFetch = useDataFetch(stripeServices.confirmPayment);
    const getShippingMethodByVariant = useDataFetch(shippingServices.getShippingMethodByVariantId);

    useEffect(() => {
        if (effectiveItems.length === 0) return;
        for (const item of effectiveItems) {
            getShippingMethodByVariant.request(item.productVariantId).onSuccess((shippingMethod) => {
                shippingMethodsMap[item.cartItemId] = shippingMethod;
            });
        }
    }, [effectiveItems]);

    const handlePaymentSubmit = useCallback(
        async (submitData: CheckoutFormSubmitData) => {
            setIsProcessing(true);
            try {
                // Step 1: Create Stripe PaymentIntent and persist ShopOrder
                createPaymentIntentFetch
                    .request(submitData.intentRequest)
                    .onSuccess((intentRes) => {
                        const { paymentIntentId, orderId } = intentRes;

                        // Step 2: Confirm Payment with Stripe / backend
                        confirmPaymentFetch
                            .request({ paymentIntentId, orderId })
                            .onSuccess((confirmRes) => {
                                setIsProcessing(false);
                                if (confirmRes.status === "success" || confirmRes.status as string === "SUCCESS") {
                                    dispatch(clearCart());
                                    if (isBuyNow) dispatch(clearBuyNowItem());
                                    toast.success("Payment authorized successfully! Your order has been placed.");
                                    router.push(`/orders/${orderId}`);
                                } else {
                                    toast.error(confirmRes.reason || "Payment confirmation failed. Please check your card details.");
                                }
                            })
                            .onError((err: string) => {
                                setIsProcessing(false);
                                toast.error(err || "Failed to confirm payment with banking gateway.");
                            });
                    })
                    .onError((err: string) => {
                        setIsProcessing(false);
                        toast.error(err || "Could not initialize checkout session. Please try again.");
                    });
            } catch (error) {
                setIsProcessing(false);
                toast.error("An unexpected error occurred during checkout.");
                console.error("Checkout error:", error);
            }
        },
        [createPaymentIntentFetch, confirmPaymentFetch, dispatch, isBuyNow, router]
    );

    return (
        <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <CheckoutForm
                    cartItems={effectiveItems}
                    subtotalAmount={effectiveTotal}
                    shippingMethods={shippingMethodsMap}
                    loading={isProcessing || createPaymentIntentFetch.isLoading || confirmPaymentFetch.isLoading}
                    onSubmit={handlePaymentSubmit}
                    currentAddress={user?.address}
                />
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
                </div>
            }
        >
            <CheckoutPageInner />
        </Suspense>
    );
}

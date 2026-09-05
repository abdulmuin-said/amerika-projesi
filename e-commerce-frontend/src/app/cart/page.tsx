/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useRef } from "react";
import CartItems from "./components/CartItems";
import CartSummary from "./components/CartSummary";
import ShippingCalculator from "./components/ShippingCalculator";
import OrderSuccessModal from "../checkout/components/OrderSuccessModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCartItems, updateCartItemAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect } from "react";

const CartPage = () => {
    const dispatch = useAppDispatch();
    const { items: cartItems, loading, error } = useAppSelector((state) => state.cart);
    const [showModal, setShowModal] = useState(false);
    const [orderId, setOrderId] = useState("");

    // Only block render on the very first fetch — not on every update/remove
    const initialLoadDone = useRef(false);
    const isInitialLoading = loading && !initialLoadDone.current;

    useEffect(() => {
        dispatch(fetchCartItems()).finally(() => {
            initialLoadDone.current = true;
        });
    }, [dispatch]);

    const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
        const result = await dispatch(updateCartItemAsync({ cartItemId, payload: { quantity: newQuantity } }));
        if (updateCartItemAsync.rejected.match(result)) {
            // Revert optimistic update by re-syncing from server
            dispatch(fetchCartItems());
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        await dispatch(removeFromCartAsync(cartItemId));
    };

    // Mirrors CartSummary logic
    const discount = cartItems.reduce((sum, item) => {
        if (!item.originalPrice) return sum;
        return sum + (item.originalPrice - item.price) * item.quantity;
    }, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = cartItems.length > 0 ? 10 : 0;
    const grandTotal = subtotal + shipping;

    if (isInitialLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground tracking-wide">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-20 text-center">
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <>
            {/* ── Page content ── */}
            <div className={`max-w-[1600px] mx-auto w-full px-6 md:px-10 py-10 md:py-14 ${cartItems.length > 0 ? "pb-36 lg:pb-14" : ""}`}>

                {/* Page heading */}
                <div className="mb-8 md:mb-10">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-1">Review</p>
                    <h1 className="font-display text-3xl md:text-4xl tracking-widest text-foreground flex items-center gap-3">
                        YOUR CART
                        {cartItems.length > 0 && (
                            <span className="text-base font-sans font-normal text-muted-foreground tracking-normal">
                                ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                            </span>
                        )}
                    </h1>
                    <div className="w-12 h-px bg-[#c9a84c]/50 mt-3" />
                </div>

                {cartItems.length === 0 ? (
                    <CartItems items={[]} onQuantityChange={handleQuantityChange} onRemoveItem={handleRemoveItem} />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

                        {/* Left — items list */}
                        <div className="w-full lg:flex-1 min-w-0">
                            <CartItems
                                items={cartItems}
                                onQuantityChange={handleQuantityChange}
                                onRemoveItem={handleRemoveItem}
                            />
                        </div>

                        {/* Right — summary + CTA */}
                        <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-[5.5rem] space-y-0">
                            <CartSummary items={cartItems} />
                            <ShippingCalculator />

                            {/* Desktop checkout button — mobile uses sticky bar */}
                            <Link href="/checkout" className="hidden lg:block">
                                <button className="w-full mt-4 bg-[oklch(0.42_0.02_55)] hover:bg-[oklch(0.35_0.02_55)] text-white text-[11px] font-semibold tracking-widest uppercase py-4 transition-colors flex items-center justify-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Proceed to Checkout
                                </button>
                            </Link>

                            <p className="hidden lg:block text-[10px] text-muted-foreground text-center mt-3 tracking-wide">
                                Secure checkout · Free returns
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Mobile sticky bottom bar ── */}
            {cartItems.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[oklch(0.42_0.02_55)] border-t-2 border-[#c9a84c]">
                    <div className="flex items-center justify-between px-5 pt-3 pb-1">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c]/80">Subtotal</p>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c]/80">incl. shipping</p>
                    </div>
                    <div className="flex items-center justify-between px-5 pb-2">
                        <div>
                            <p className="text-xl font-semibold text-white">
                                ${grandTotal.toFixed(2)}
                            </p>
                            {discount > 0 && (
                                <p className="text-[11px] text-amber-400 mt-0.5">
                                    🎉 You saved ${discount.toFixed(2)} on this order
                                </p>
                            )}
                        </div>
                        <Link href="/checkout">
                            <button className="bg-[#c9a84c] hover:bg-[#b8960c] text-[oklch(0.16_0.02_55)] text-[11px] font-semibold tracking-widest uppercase px-6 py-2.5 transition-colors flex items-center gap-2">
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Checkout
                            </button>
                        </Link>
                    </div>
                </div>
            )}

            <OrderSuccessModal isOpen={showModal} onClose={() => setShowModal(false)} orderId={orderId} />
        </>
    );
};

export default CartPage;

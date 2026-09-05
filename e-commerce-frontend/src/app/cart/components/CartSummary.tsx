"use client";
import React from "react";
import { CartItemPreview } from "@/types/domains/cart";

interface CartSummaryProps {
    items: CartItemPreview[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
    const productTotal = items.reduce((sum, item) => {
        const base = item.originalPrice ?? item.price;
        return sum + base * item.quantity;
    }, 0);

    const discount = items.reduce((sum, item) => {
        if (!item.originalPrice) return sum;
        return sum + (item.originalPrice - item.price) * item.quantity;
    }, 0);

    const subtotal = productTotal - discount;
    const shipping = items.length > 0 ? 10 : 0;
    const total = subtotal + shipping;

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className="bg-white border border-border/60 p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-1">Summary</p>
            <h2 className="font-display text-xl tracking-widest text-foreground mb-5">ORDER SUMMARY</h2>

            <div className="space-y-3 text-sm">
                {/* Product total (full price before discount) */}
                <div className="flex justify-between text-muted-foreground">
                    <span>Product Total</span>
                    <span className="text-foreground font-medium">{fmt(productTotal)}</span>
                </div>

                {/* Discount line — only shown when there is one */}
                {discount > 0 && (
                    <div className="flex justify-between text-amber-600">
                        <span className="font-medium">Discount</span>
                        <span className="font-medium">− {fmt(discount)}</span>
                    </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground font-medium">
                        {items.length === 0 ? "—" : fmt(shipping)}
                    </span>
                </div>

                {/* Subtotal = grand total */}
                <div className="border-t border-border/50 pt-3 mt-1 flex justify-between">
                    <span className="font-semibold text-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground text-base">{fmt(total)}</span>
                </div>
            </div>

            {discount > 0 && (
                <p className="mt-3 text-xs text-amber-600 font-medium">
                    You save {fmt(discount)} on this order
                </p>
            )}
        </div>
    );
};

export default CartSummary;

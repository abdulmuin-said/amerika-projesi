"use client";
import React from "react";
import { CartItemPreview } from "@/types/domains/cart";
import { useLocalization } from "@/lib/useLocalization";

interface CartSummaryProps {
    items: CartItemPreview[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
    const { t, locale, formatPrice } = useLocalization();

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

    return (
        <div className="bg-white border border-border/60 p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-1">
                {locale === "tr" ? "Özet" : "Summary"}
            </p>
            <h2 className="font-display text-xl tracking-widest text-foreground mb-5">
                {t("cart.orderSummary").toUpperCase()}
            </h2>

            <div className="space-y-3 text-sm">
                {/* Product total (full price before discount) */}
                <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.productTotal")}</span>
                    <span className="text-foreground font-medium">{formatPrice(productTotal)}</span>
                </div>

                {/* Discount line — only shown when there is one */}
                {discount > 0 && (
                    <div className="flex justify-between text-amber-600">
                        <span className="font-medium">{t("cart.discount")}</span>
                        <span className="font-medium">− {formatPrice(discount)}</span>
                    </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.shipping")}</span>
                    <span className="text-foreground font-medium">
                        {items.length === 0 ? "—" : (shipping === 0 ? t("cart.freeShipping") : formatPrice(shipping))}
                    </span>
                </div>

                {/* Subtotal = grand total */}
                <div className="border-t border-border/50 pt-3 mt-1 flex justify-between">
                    <span className="font-semibold text-foreground">{t("cart.subtotal")}</span>
                    <span className="font-semibold text-foreground text-base">{formatPrice(total)}</span>
                </div>
            </div>

            {discount > 0 && (
                <p className="mt-3 text-xs text-amber-600 font-medium">
                    {t("cart.youSave", { amount: formatPrice(discount) })}
                </p>
            )}
        </div>
    );
};

export default CartSummary;

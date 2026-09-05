"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { X, ShoppingCart, FrameIcon, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCartItemAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import Link from "next/link";

export default function CartToast() {
    const dispatch = useAppDispatch();
    const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
    const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

    // Newest first
    const sorted = [...cartItems].sort((a, b) => b.cartItemId - a.cartItemId);

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    async function changeQty(cartItemId: number, currentQty: number, delta: number, maxQty: number) {
        const newQty = currentQty + delta;
        if (newQty < 1 || newQty > maxQty || loadingItemId !== null) return;
        setLoadingItemId(cartItemId);
        await dispatch(updateCartItemAsync({ cartItemId, payload: { quantity: newQty } }));
        setLoadingItemId(null);
    }

    async function removeItem(cartItemId: number) {
        if (loadingItemId !== null) return;
        setLoadingItemId(cartItemId);
        const result = await dispatch(removeFromCartAsync(cartItemId));
        if (removeFromCartAsync.fulfilled.match(result)) {
            // dismiss toast if cart becomes empty after this removal
            const remaining = cartItems.filter(i => i.cartItemId !== cartItemId);
            if (remaining.length === 0) toast.dismiss("cart-toast");
        }
        setLoadingItemId(null);
    }

    return (
        <div className="w-full bg-white border border-[#c9a84c]/30 shadow-xl overflow-hidden">

            {/* Header */}
            <div className="bg-[oklch(0.42_0.02_55)] px-4 py-3 flex items-center justify-between border-b-2 border-[#c9a84c]">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-[#c9a84c]" />
                    <p className="text-[11px] tracking-[0.2em] uppercase text-white font-medium">
                        Cart · {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                    </p>
                </div>
                <button
                    onClick={() => toast.dismiss("cart-toast")}
                    className="text-white/50 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Items — newest at top */}
            <ul className="divide-y divide-border/40 max-h-60 overflow-y-auto thin-scrollbar">
                {sorted.map((item, i) => (
                    <li
                        key={item.cartItemId}
                        className={`flex gap-3 px-4 py-3 ${i === 0 ? "bg-[#c9a84c]/5" : "bg-white"}`}
                    >
                        {/* Gold top-line on newest item */}
                        {/* Image */}
                        <div className="relative w-12 h-12 flex-shrink-0 bg-muted overflow-hidden self-start mt-0.5">
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[oklch(0.42_0.02_55)]/8">
                                    <FrameIcon className="h-4 w-4 text-[#c9a84c]/30" strokeWidth={1} />
                                </div>
                            )}
                            {i === 0 && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#c9a84c]" />}
                        </div>

                        {/* Info + controls */}
                        <div className="flex-1 min-w-0">
                            {/* Title */}
                            <p className="text-xs font-semibold text-foreground truncate leading-tight mb-1">
                                {item.title}
                            </p>

                            {/* Variation options instead of SKU */}
                            {item.variationOptions && item.variationOptions.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {item.variationOptions.map(vo => (
                                        <span
                                            key={vo.variationOptionId}
                                            className="text-[10px] border border-border/50 text-foreground/60 px-1.5 py-0.5 bg-muted/40"
                                        >
                                            {vo.optionName}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-muted-foreground/50 truncate mb-2">—</p>
                            )}

                            {/* Qty controls + price + remove */}
                            <div className="flex items-center justify-between gap-2">
                                {/* Qty */}
                                <div className="flex items-center border border-border/60">
                                    <button
                                        onClick={() => changeQty(item.cartItemId, item.quantity, -1, item.quantityInStock)}
                                        disabled={item.quantity <= 1 || loadingItemId === item.cartItemId}
                                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                                    >
                                        <Minus className="h-2.5 w-2.5" />
                                    </button>
                                    <span className="w-7 text-center text-xs font-medium text-foreground select-none">
                                        {loadingItemId === item.cartItemId
                                            ? <Loader2 className="h-2.5 w-2.5 animate-spin mx-auto" />
                                            : item.quantity
                                        }
                                    </span>
                                    <button
                                        onClick={() => changeQty(item.cartItemId, item.quantity, 1, item.quantityInStock)}
                                        disabled={item.quantity >= item.quantityInStock || loadingItemId === item.cartItemId}
                                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                                    >
                                        <Plus className="h-2.5 w-2.5" />
                                    </button>
                                </div>

                                {/* Price */}
                                <p className="text-xs font-semibold text-foreground flex-1 text-right">
                                    {fmt(item.price * item.quantity)}
                                </p>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(item.cartItemId)}
                                    disabled={loadingItemId === item.cartItemId}
                                    className="text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors ml-1"
                                    aria-label="Remove"
                                >
                                    {loadingItemId === item.cartItemId
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />
                                    }
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Total</p>
                    <p className="text-sm font-semibold text-foreground">{fmt(totalAmount)}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/cart" className="flex-1" onClick={() => toast.dismiss("cart-toast")}>
                        <button className="w-full border border-foreground/20 text-foreground text-[10px] tracking-widest uppercase py-2 hover:bg-muted transition-colors">
                            View Cart
                        </button>
                    </Link>
                    <Link href="/checkout" className="flex-1" onClick={() => toast.dismiss("cart-toast")}>
                        <button className="w-full bg-[oklch(0.42_0.02_55)] hover:bg-[oklch(0.35_0.02_55)] text-white text-[10px] tracking-widest uppercase py-2 transition-colors">
                            Checkout
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

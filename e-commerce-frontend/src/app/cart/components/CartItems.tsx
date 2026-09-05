"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Minus, Plus, FrameIcon, Loader2 } from 'lucide-react';
import { CartItemPreview } from '@/types/domains/cart';
import Link from 'next/link';

interface CartItemsProps {
    items: CartItemPreview[];
    onQuantityChange: (cartItemId: number, newQuantity: number) => Promise<void>;
    onRemoveItem: (cartItemId: number) => Promise<void>;
}

function BrandedPlaceholder() {
    return (
        <div className="w-full h-full bg-[oklch(0.42_0.02_55)]/8 flex flex-col items-center justify-center gap-1">
            <FrameIcon className="h-8 w-8 text-[#c9a84c]/30" strokeWidth={1} />
            <span className="text-[9px] tracking-widest text-[#c9a84c]/40 uppercase">No Image</span>
        </div>
    );
}

function CartItemCard({ item, onQuantityChange, onRemoveItem }: {
    item: CartItemPreview;
    onQuantityChange: (cartItemId: number, newQuantity: number) => Promise<void>;
    onRemoveItem: (cartItemId: number) => Promise<void>;
}) {
    const [imgError, setImgError] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [updatingDir, setUpdatingDir] = useState<'inc' | 'dec' | null>(null);

    const lineTotal = item.price * item.quantity;
    const originalLineTotal = item.originalPrice ? item.originalPrice * item.quantity : null;
    const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;

    const handleQtyChange = async (newQty: number, dir: 'inc' | 'dec') => {
        if (updatingDir !== null || isRemoving) return;
        setUpdatingDir(dir);
        try {
            await onQuantityChange(item.cartItemId, newQty);
        } finally {
            setUpdatingDir(null);
        }
    };

    const handleRemove = async () => {
        if (isRemoving || updatingDir !== null) return;
        setIsRemoving(true);
        try {
            await onRemoveItem(item.cartItemId);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-border/60 hover:border-[#c9a84c]/30 transition-colors group">

            {/* Product image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-muted overflow-hidden">
                {item.imageUrl && !imgError ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <BrandedPlaceholder />
                )}
                {hasDiscount && item.promotionType && (
                    <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-semibold tracking-wide px-1.5 py-0.5 leading-tight">
                        {item.promotionType === "PERCENTAGE"
                            ? `-${item.discountValue}%`
                            : `-$${item.discountValue}`}
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-snug mb-1.5">
                    {item.title}
                </h3>

                {/* Variation chips + Remove button on right edge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap gap-1.5">
                        {item.variationOptions && item.variationOptions.length > 0
                            ? item.variationOptions.map((vo) => (
                                <span
                                    key={vo.variationOptionId}
                                    className="inline-block border border-border/60 text-[10px] text-foreground/70 tracking-wide px-2 py-0.5 bg-muted/40"
                                >
                                    {vo.optionName}
                                </span>
                            ))
                            : null
                        }
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Remove item"
                    >
                        {isRemoving
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                        }
                        <span className="hidden sm:inline">Remove</span>
                    </button>
                </div>

                {/* SKU */}
                <p className="text-[10px] tracking-widest text-muted-foreground/60 uppercase mb-3 truncate">
                    SKU: {item.sku}
                </p>

                {/* Quantity + price row */}
                <div className="flex items-center justify-between gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border/70">
                        <button
                            onClick={() => handleQtyChange(item.quantity - 1, 'dec')}
                            disabled={item.quantity <= 1 || updatingDir !== null || isRemoving}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                        >
                            {updatingDir === 'dec'
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Minus className="h-3 w-3" />
                            }
                        </button>
                        <span className="w-8 sm:w-10 text-center text-sm font-medium text-foreground select-none">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => handleQtyChange(item.quantity + 1, 'inc')}
                            disabled={item.quantity >= item.quantityInStock || updatingDir !== null || isRemoving}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                        >
                            {updatingDir === 'inc'
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Plus className="h-3 w-3" />
                            }
                        </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                            ${lineTotal.toFixed(2)}
                        </p>
                        {hasDiscount && originalLineTotal && (
                            <p className="text-xs text-muted-foreground line-through leading-tight">
                                ${originalLineTotal.toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const CartItems: React.FC<CartItemsProps> = ({ items, onQuantityChange, onRemoveItem }) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-16 h-px bg-[#c9a84c]/40 mb-8" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Cart</p>
                <h2 className="font-display text-2xl tracking-widest text-foreground mb-2">Your cart is empty</h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                    Discover our curated collection of premium wall art and frames.
                </p>
                <Link href="/products">
                    <button className="bg-[oklch(0.42_0.02_55)] hover:bg-[oklch(0.35_0.02_55)] text-white text-[11px] tracking-widest uppercase px-8 py-3 transition-colors">
                        Explore Collection
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <CartItemCard
                    key={item.cartItemId}
                    item={item}
                    onQuantityChange={onQuantityChange}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </div>
    );
};

export default CartItems;

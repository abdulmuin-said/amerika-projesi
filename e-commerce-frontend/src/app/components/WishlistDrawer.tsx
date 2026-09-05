"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import placeholderImage from "@/../public/placeholder-image.jpeg";
import { toast } from "sonner";
import CartToast from "./CartToast";
import { useRouter } from "next/navigation";

interface WishlistDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { authenticated } = useAppSelector((state) => state.auth);
    const { items, loading: wishlistLoading } = useAppSelector(state => state.wishlist);

    const handleAddToCart = async (productVariantId: number) => {
        await dispatch(addToCart({ productVariantId, quantity: 1 }));
        if (toast.getToasts().find((t) => t.id === "cart-toast")) return;
        toast(CartToast, {
            id: "cart-toast",
            position: "bottom-left",
            closeButton: false,
            style: { display: "block", padding: "0px", width: "min(500px, calc(100vw - 24px))", maxWidth: "500px", height: "auto" },
            dismissible: false,
            duration: Infinity,
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md flex flex-col p-0 bg-[oklch(0.99_0.004_75)] border-l border-[#c9a84c]/30"
            >
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-1">My Collection</p>
                            <SheetTitle className="text-xl font-display tracking-widest text-foreground">
                                WISHLIST
                            </SheetTitle>
                        </div>
                        {items.length > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        )}
                    </div>
                </SheetHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {wishlistLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground tracking-wide">Loading your wishlist...</p>
                        </div>

                    ) : !authenticated ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Heart className="h-14 w-14 text-[#c9a84c]/30 mb-5" strokeWidth={1} />
                            <p className="text-sm font-medium text-foreground mb-1">Sign in to view your wishlist</p>
                            <p className="text-xs text-muted-foreground mb-6">Save pieces you love and revisit them anytime.</p>
                            <Button
                                onClick={() => { onOpenChange(false); router.push("/auth/login"); }}
                                className="bg-[oklch(0.42_0.02_55)] hover:bg-[oklch(0.35_0.02_55)] text-white text-xs tracking-widest uppercase px-6 h-9 rounded-none"
                            >
                                Sign In
                            </Button>
                        </div>

                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Heart className="h-14 w-14 text-[#c9a84c]/30 mb-5" strokeWidth={1} />
                            <p className="text-sm font-medium text-foreground mb-1">Your wishlist is empty</p>
                            <p className="text-xs text-muted-foreground mb-6">Discover pieces that speak to your space.</p>
                            <Button
                                variant="outline"
                                onClick={() => { onOpenChange(false); router.push("/products"); }}
                                className="text-xs tracking-widest uppercase px-6 h-9 rounded-none border-foreground/20 hover:bg-muted"
                            >
                                Explore Collection
                            </Button>
                        </div>

                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div
                                    key={item.wishlistItemId}
                                    className="flex gap-4 p-4 bg-white border border-border/60 hover:border-[#c9a84c]/40 transition-colors group"
                                >
                                    {/* Image */}
                                    <div className="relative w-20 h-20 flex-shrink-0 bg-muted overflow-hidden">
                                        <Image
                                            src={item.productImageUrl || placeholderImage}
                                            alt={item.productVariant.sku}
                                            unoptimized
                                            fill
                                            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Product title */}
                                        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1">
                                            {item.productTitle ?? "—"}
                                        </p>
                                        {/* SKU — truncated so it never overflows */}
                                        <p className="text-[10px] tracking-widest text-muted-foreground/60 uppercase truncate mb-1">
                                            {item.productVariant.sku}
                                        </p>
                                        {/* Price */}
                                        <p className="text-sm font-semibold text-foreground mb-2">
                                            ${item.productVariant.price.toFixed(2)}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAddToCart(item.productVariant.productVariantId)}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-[oklch(0.42_0.02_55)] hover:bg-[oklch(0.35_0.02_55)] text-white text-[10px] tracking-widest uppercase py-1.5 transition-colors"
                                            >
                                                <ShoppingCart className="h-3 w-3" />
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => dispatch(removeFromWishlistAsync(item.wishlistItemId))}
                                                disabled={!item.wishlistItemId || !authenticated}
                                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                                                aria-label="Remove from wishlist"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer CTA */}
                {authenticated && items.length > 0 && (
                    <div className="px-6 py-4 border-t border-border/50 shrink-0">
                        <Link href="/products" onClick={() => onOpenChange(false)}>
                            <button className="w-full flex items-center justify-center gap-2 border border-foreground/20 text-foreground text-xs tracking-widest uppercase py-2.5 hover:bg-muted transition-colors">
                                Continue Browsing
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

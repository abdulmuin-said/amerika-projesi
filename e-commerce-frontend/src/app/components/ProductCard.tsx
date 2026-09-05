"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { ProductPreview } from "@/types/domains/product";
import { PromotionDetails } from "@/types/domains/promotion";
import { toast } from "sonner";
import CartToast from "./CartToast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";

function NoImagePlaceholder() {
   return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[oklch(0.92_0.022_75)]">
         <div className="absolute inset-4 border border-[#c9a84c]/25 pointer-events-none" />
         <svg className="h-9 w-9 text-[#c9a84c]/35 mb-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
            <rect x="2" y="2" width="20" height="20" />
            <circle cx="8" cy="8.5" r="1.8" />
            <polyline points="22 15 16 9 4 22" />
         </svg>
         <span className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c]/50 font-medium">No Image</span>
      </div>
   );
}

function getDiscountedPrice(price: number, promotion: PromotionDetails | null): number {
   if (!promotion) return price;
   if (promotion.promotionType === "PERCENTAGE") return price * (1 - promotion.discountValue / 100);
   return Math.max(price - promotion.discountValue, 0);
}

export default function ProductCard({ product, promo }: { product: ProductPreview; promo: PromotionDetails | null }) {
   const dispatch = useAppDispatch();
   const wishlistItems = useAppSelector((state) => state.wishlist.items);
   const { authenticated } = useAppSelector((state) => state.auth);
   const wishlistItem = wishlistItems.find(item => item.productVariant.productVariantId === product.productVariantId);
   const isInWishlist = wishlistItem !== undefined;
   const discounted = getDiscountedPrice(product.price, promo);
   const isDiscounted = promo && discounted < product.price;
   const isInactive = product.status === false;

   // Image carousel
   const images: string[] = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
   const hasImages = images.length > 0;
   const [imgIndex, setImgIndex] = useState(0);
   const touchStartX = useRef<number | null>(null);

   const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
   };

   const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null || images.length <= 1) return;
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
         if (delta > 0) setImgIndex(i => Math.min(i + 1, images.length - 1));
         else setImgIndex(i => Math.max(i - 1, 0));
      }
      touchStartX.current = null;
   };

   // Local optimistic state for instant UI response (0ms delay)
   const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
   const isCurrentlyLiked = optimisticLiked !== null ? optimisticLiked : isInWishlist;

   const handleWishlistToggle = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!authenticated) { toast.error("Please login to add items to wishlist"); return; }

      const nextLiked = !isCurrentlyLiked;
      setOptimisticLiked(nextLiked);
      if (nextLiked) {
         toast.success("Added to wishlist");
      } else {
         toast.success("Removed from wishlist");
      }

      try {
         if (!nextLiked && wishlistItem?.wishlistItemId) {
            await dispatch(removeFromWishlistAsync(wishlistItem.wishlistItemId));
         } else {
            await dispatch(addToWishlistAsync(product.productVariantId));
         }
      } catch {
         setOptimisticLiked(!nextLiked);
         toast.error("Failed to update wishlist");
      }
   };

   const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isInactive) return;

      // Instantly open the cart toast without waiting for server network delay
      if (!toast.getToasts().find((t) => t.id === "cart-toast")) {
         toast(CartToast, {
            id: "cart-toast",
            position: "bottom-left",
            closeButton: false,
            style: { display: "block", padding: "0px", width: "min(500px, calc(100vw - 24px))", maxWidth: "500px", height: "auto" },
            dismissible: false,
            duration: Infinity,
         });
      }

      // Sync with server in background
      dispatch(addToCart({ productVariantId: product.productVariantId, quantity: 1 }));
   };

   return (
      <Link href={`/products/${product.productId}`} className="block w-full group">

         {/* Image */}
         <div
            className={["relative aspect-square overflow-hidden bg-muted", isInactive ? "grayscale" : ""].join(" ")}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
         >

            {hasImages ? (
               <Image
                  src={images[imgIndex]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={90}
                  className={["object-contain transition-transform duration-500", isInactive ? "" : "group-hover:scale-[1.04]"].join(" ")}
               />
            ) : (
               <NoImagePlaceholder />
            )}

            {isInactive && <div className="absolute inset-0 bg-black/30 z-[5]" />}

            {/* Status badges — top left */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
               {isInactive && (
                  <Badge className="rounded-none bg-black text-white border-0 text-[10px] tracking-wide px-2 py-0.5">
                     Unavailable
                  </Badge>
               )}
               {product.quantityInStock < 10 && product.quantityInStock > 0 && !isInactive && (
                  <Badge className="rounded-sm bg-foreground text-background border-0 text-[10px] tracking-wide px-2 py-0.5">
                     Only {product.quantityInStock} left
                  </Badge>
               )}
            </div>

            {/* Wishlist + mobile cart — top right, stacked */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-2">
               <button
                  onClick={handleWishlistToggle}
                  disabled={isInactive}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/50 flex items-center justify-center shadow-sm transition-colors hover:bg-white/70"
                  aria-label={isCurrentlyLiked ? "Remove from wishlist" : "Add to wishlist"}
               >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${isCurrentlyLiked ? "fill-red-500 text-red-500" : "text-foreground/70"}`} />
               </button>

               {/* Mobile-only cart icon — always visible since hover doesn't work on touch */}
               {!isInactive && (
                  <button
                     onClick={handleAddToCart}
                     className="sm:hidden w-6 h-6 rounded-full bg-white/50 flex items-center justify-center shadow-sm hover:bg-white/70"
                     aria-label="Add to cart"
                  >
                     <ShoppingCart className="h-3 w-3 text-foreground/70" />
                  </button>
               )}
            </div>

            {/* Swipe dot indicators — mobile only, multiple images */}
            {images.length > 1 && (
               <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1 sm:hidden pointer-events-none">
                  {images.map((_, i) => (
                     <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/40"}`}
                     />
                  ))}
               </div>
            )}

            {/* Add to Cart — slides up on hover (desktop only) */}
            {!isInactive && (
               <div className="hidden sm:block absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                     onClick={handleAddToCart}
                     className="w-full flex items-center justify-center gap-2 bg-[oklch(0.16_0.02_55)]/90 backdrop-blur-sm hover:bg-[oklch(0.16_0.02_55)] text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors"
                  >
                     <ShoppingCart className="h-3.5 w-3.5" />
                     Add to Cart
                  </button>
               </div>
            )}
         </div>

         {/* Info */}
         <div className="pt-3 pb-1">

            {/* Stars — reserved height */}
            <div className="flex items-center gap-1.5 mb-1.5" style={{ minHeight: "1.25rem" }}>
               {product.rating > 0 && (
                  <>
                     <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                           <svg key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-none text-amber-300/60"}`} viewBox="0 0 20 20">
                              <path stroke="currentColor" strokeWidth={i < Math.floor(product.rating) ? 0 : 1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                        ))}
                     </div>
                     <span className="text-[11px] text-muted-foreground">({product.rating})</span>
                  </>
               )}
            </div>

            {/* Title — reserved 2 lines */}
            <h3 className="font-display text-xl font-semibold leading-snug line-clamp-2 text-foreground mb-2" style={{ minHeight: "3.375rem" }}>
               {product.title}
            </h3>

            {/* Discount badge — reserved height */}
            <div className="mb-2" style={{ minHeight: "1.5rem" }}>
               {isDiscounted && promo && !isInactive && (
                  <Badge className="rounded-sm bg-amber-600 hover:bg-amber-600 text-white border-0 text-[10px] font-semibold tracking-wide px-2 py-0.5">
                     {promo.promotionType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                  </Badge>
               )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
               <span className="text-sm text-muted-foreground font-normal">From</span>
               <span className="text-base font-semibold text-foreground">${discounted.toFixed(2)}</span>
               {isDiscounted && (
                  <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
               )}
            </div>

         </div>
      </Link>
   );
}

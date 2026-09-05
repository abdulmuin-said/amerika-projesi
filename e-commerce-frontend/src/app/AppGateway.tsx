/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAutoFreeze } from "immer";
import { getMyInformation } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { fetchCategories } from "@/store/slices/categorySlice";
import { fetchVariations } from "@/store/slices/variationSlice";
import { fetchAttributes } from "@/store/slices/attributeSlice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clearCart, fetchCartItems } from "@/store/slices/cartSlice";
import { clearWishlist, fetchWishlistItems } from "@/store/slices/wishlistSlice";
import { fetchPromotions } from "@/store/slices/promotionSlice";

setAutoFreeze(false);

export function AppGateway({ children }: { children: React.ReactNode }) {
   const dispatch = useAppDispatch();
   const { authenticated, user } = useAppSelector(state => state.auth);
   useEffect(() => {
      dispatch(getMyInformation());
      dispatch(fetchCategories());
      dispatch(fetchVariations());
      dispatch(fetchAttributes());
      dispatch(fetchPromotions());
   }, []);
   useEffect(() => {
      if (authenticated) {
         dispatch(fetchCartItems());
         dispatch(fetchWishlistItems());
      } else {
         dispatch(clearCart());
         dispatch(clearWishlist());
      }
   }, [authenticated, user]);

   return (
      <TooltipProvider delayDuration={0}>
         {children}
         <Toaster />
      </TooltipProvider>
   );
}

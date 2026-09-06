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
import { setLocale, setCurrency, SupportedLocale, SupportedCurrency } from "@/store/slices/localeSlice";

setAutoFreeze(false);

export function AppGateway({ children }: { children: React.ReactNode }) {
   const dispatch = useAppDispatch();
   const { authenticated, user } = useAppSelector(state => state.auth);
   const currentLocale = useAppSelector(state => state.locale.locale);

   // Auto-detect & hydrate locale / currency from localStorage or browser preferences
   useEffect(() => {
      try {
         const storedLocale = localStorage.getItem("novalux_locale") as SupportedLocale | null;
         const storedCurrency = localStorage.getItem("novalux_currency") as SupportedCurrency | null;

         if (storedLocale && (storedLocale === "en" || storedLocale === "tr")) {
            dispatch(setLocale(storedLocale));
            if (storedCurrency && (storedCurrency === "USD" || storedCurrency === "TRY")) {
               dispatch(setCurrency(storedCurrency));
            }
            document.documentElement.lang = storedLocale;
         } else {
            // Check browser language
            const browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase();
            const detectedLocale: SupportedLocale = browserLang.startsWith("tr") ? "tr" : "en";
            const detectedCurrency: SupportedCurrency = detectedLocale === "tr" ? "TRY" : "USD";

            dispatch(setLocale(detectedLocale));
            dispatch(setCurrency(detectedCurrency));
            localStorage.setItem("novalux_locale", detectedLocale);
            localStorage.setItem("novalux_currency", detectedCurrency);
            document.documentElement.lang = detectedLocale;
         }
      } catch {
         // Silently handle SSR or restricted localStorage environments
      }
   }, []);

   // Keep <html> lang attribute in sync with state
   useEffect(() => {
      if (typeof document !== "undefined") {
         document.documentElement.lang = currentLocale;
      }
   }, [currentLocale]);

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

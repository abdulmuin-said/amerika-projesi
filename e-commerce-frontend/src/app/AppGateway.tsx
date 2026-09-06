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

// Helper function to auto-detect Turkish vs International visitor
function detectUserLocaleAndCurrency(): { locale: SupportedLocale; currency: SupportedCurrency } {
   try {
      const languages = (typeof navigator !== "undefined" && navigator.languages && navigator.languages.length > 0)
         ? Array.from(navigator.languages)
         : [typeof navigator !== "undefined" ? (navigator.language || "") : ""];

      const isTurkishLang = languages.some((lang) => {
         const l = lang.toLowerCase();
         return l.startsWith("tr") || l === "tr-tr";
      });

      let isTurkishTimeZone = false;
      try {
         const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
         if (tz.includes("istanbul") || tz.includes("turkey")) {
            isTurkishTimeZone = true;
         }
      } catch {
         // ignore timezone error
      }

      if (isTurkishLang || isTurkishTimeZone) {
         return { locale: "tr", currency: "TRY" };
      }
   } catch {
      // ignore
   }

   return { locale: "en", currency: "USD" };
}

export function AppGateway({ children }: { children: React.ReactNode }) {
   const dispatch = useAppDispatch();
   const { authenticated, user } = useAppSelector(state => state.auth);
   const currentLocale = useAppSelector(state => state.locale.locale);

   // Auto-detect & hydrate locale / currency from browser preferences or user selection
   useEffect(() => {
      try {
         const userExplicitlySelected = localStorage.getItem("novalux_user_selected_locale") === "true";
         const storedLocale = localStorage.getItem("novalux_locale") as SupportedLocale | null;
         const storedCurrency = localStorage.getItem("novalux_currency") as SupportedCurrency | null;

         if (userExplicitlySelected && storedLocale && (storedLocale === "en" || storedLocale === "tr")) {
            dispatch(setLocale(storedLocale));
            if (storedCurrency && (storedCurrency === "USD" || storedCurrency === "TRY")) {
               dispatch(setCurrency(storedCurrency));
            }
            document.documentElement.lang = storedLocale;
         } else {
            // Automatic detection based on browser and timezone
            const { locale: detectedLocale, currency: detectedCurrency } = detectUserLocaleAndCurrency();
            dispatch(setLocale(detectedLocale));
            dispatch(setCurrency(detectedCurrency));
            localStorage.setItem("novalux_locale", detectedLocale);
            localStorage.setItem("novalux_currency", detectedCurrency);
            document.documentElement.lang = detectedLocale;
         }
      } catch {
         // Silently handle SSR or restricted localStorage environments
      }
   }, [dispatch]);

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

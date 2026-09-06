"use client";
import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLocale, setCurrency, toggleLocale, SupportedLocale, SupportedCurrency } from "@/store/slices/localeSlice";
import { translateReviewToEnglish } from "./reviewLocalization";
import enMessages from "@/locales/en.json";
import trMessages from "@/locales/tr.json";

const messages: Record<SupportedLocale, Record<string, unknown>> = {
    en: enMessages,
    tr: trMessages
};

// Fallback USD to TRY exchange rate if a variant doesn't have an explicit priceTry
const FALLBACK_USD_TO_TRY_RATE = 38.5;

/**
 * Traverses an object with dot notation path (e.g. "header.searchPlaceholder")
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((curr: unknown, key: string) => {
        if (curr && typeof curr === "object" && key in (curr as Record<string, unknown>)) {
            return (curr as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

export function useLocalization() {
    const dispatch = useAppDispatch();
    const { locale, currency } = useAppSelector((state) => state.locale);

    /**
     * Translation function: t("header.searchPlaceholder", { count: 3 })
     */
    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            const currentDict = messages[locale] || messages.en;
            let val = getNestedValue(currentDict, key);

            // Fallback to English if missing in current language
            if (val === undefined || typeof val !== "string") {
                val = getNestedValue(messages.en, key);
            }

            if (typeof val !== "string") {
                return key;
            }

            // Interpolate params {count}, {name}, etc.
            if (params) {
                return Object.entries(params).reduce((acc, [pKey, pVal]) => {
                    return acc.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
                }, val);
            }

            return val;
        },
        [locale]
    );

    /**
     * Dual Currency Formatter:
     * - In TRY mode: formats priceTry if available, or converted USD amount, in ₺
     * - In USD mode: formats priceUsd in $
     */
    const formatPrice = useCallback(
        (priceUsd: number, priceTry?: number | null): string => {
            if (currency === "TRY") {
                const targetTry = (priceTry != null && priceTry > 0)
                    ? priceTry
                    : Math.round(priceUsd * FALLBACK_USD_TO_TRY_RATE);

                return new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                    maximumFractionDigits: 0
                }).format(targetTry);
            }

            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(priceUsd || 0);
        },
        [currency]
    );

    /**
     * Returns localized product title
     */
    const getLocalizedTitle = useCallback(
        (title: string, titleTr?: string | null): string => {
            if (locale === "tr" && titleTr && titleTr.trim().length > 0) {
                return titleTr.trim();
            }
            return title || "";
        },
        [locale]
    );

    /**
     * Returns localized product description
     */
    const getLocalizedDescription = useCallback(
        (desc: string, descTr?: string | null): string => {
            if (locale === "tr" && descTr && descTr.trim().length > 0) {
                return descTr.trim();
            }
            return desc || "";
        },
        [locale]
    );

    /**
     * Returns localized customer review:
     * - In TR mode: original Turkish review
     * - In EN mode: fluent natural English translation
     */
    const getLocalizedReview = useCallback(
        (reviewText: string): string => {
            if (locale === "tr") {
                return reviewText || "";
            }
            return translateReviewToEnglish(reviewText);
        },
        [locale]
    );

    /**
     * Switch locale and persist to localStorage
     */
    const switchLocale = useCallback(
        (newLocale: SupportedLocale) => {
            dispatch(setLocale(newLocale));
            if (typeof window !== "undefined") {
                localStorage.setItem("novalux_locale", newLocale);
                localStorage.setItem("novalux_currency", newLocale === "tr" ? "TRY" : "USD");
                document.documentElement.lang = newLocale;
            }
        },
        [dispatch]
    );

    /**
     * Switch currency and persist to localStorage
     */
    const switchCurrency = useCallback(
        (newCurrency: SupportedCurrency) => {
            dispatch(setCurrency(newCurrency));
            if (typeof window !== "undefined") {
                localStorage.setItem("novalux_currency", newCurrency);
            }
        },
        [dispatch]
    );

    return {
        locale,
        currency,
        t,
        formatPrice,
        getLocalizedTitle,
        getLocalizedDescription,
        getLocalizedReview,
        switchLocale,
        switchCurrency,
        toggleLocale: () => dispatch(toggleLocale())
    };
}

/**
 * Standard alias for useLocalization
 */
export const useTranslation = useLocalization;

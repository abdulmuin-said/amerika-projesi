"use client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLocale, setCurrency, toggleLocale, SupportedLocale, SupportedCurrency } from "@/store/slices/localeSlice";

export function useLocalization() {
    const dispatch = useAppDispatch();
    const { locale, currency } = useAppSelector((state) => state.locale);

    const formatPrice = (priceUsd: number, priceTry?: number | null) => {
        if (currency === 'TRY' && priceTry != null && priceTry > 0) {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0
            }).format(priceTry);
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(priceUsd);
    };

    const getLocalizedTitle = (title: string, titleTr?: string | null) => {
        if (locale === 'tr' && titleTr && titleTr.trim().length > 0) {
            return titleTr;
        }
        return title;
    };

    const getLocalizedDescription = (desc: string, descTr?: string | null) => {
        if (locale === 'tr' && descTr && descTr.trim().length > 0) {
            return descTr;
        }
        return desc;
    };

    const switchLocale = (newLocale: SupportedLocale) => {
        dispatch(setLocale(newLocale));
    };

    const switchCurrency = (newCurrency: SupportedCurrency) => {
        dispatch(setCurrency(newCurrency));
    };

    return {
        locale,
        currency,
        formatPrice,
        getLocalizedTitle,
        getLocalizedDescription,
        switchLocale,
        switchCurrency,
        toggleLocale: () => dispatch(toggleLocale())
    };
}

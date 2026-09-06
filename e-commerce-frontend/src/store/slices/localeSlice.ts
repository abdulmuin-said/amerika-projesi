import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SupportedLocale = 'en' | 'tr';
export type SupportedCurrency = 'USD' | 'TRY';

interface LocaleState {
    locale: SupportedLocale;
    currency: SupportedCurrency;
}

const initialState: LocaleState = {
    locale: 'en',
    currency: 'USD',
};

export const localeSlice = createSlice({
    name: 'locale',
    initialState,
    reducers: {
        setLocale: (state, action: PayloadAction<SupportedLocale>) => {
            state.locale = action.payload;
            if (action.payload === 'tr') {
                state.currency = 'TRY';
            } else {
                state.currency = 'USD';
            }
        },
        setCurrency: (state, action: PayloadAction<SupportedCurrency>) => {
            state.currency = action.payload;
        },
        toggleLocale: (state) => {
            if (state.locale === 'en') {
                state.locale = 'tr';
                state.currency = 'TRY';
            } else {
                state.locale = 'en';
                state.currency = 'USD';
            }
        }
    },
});

export const { setLocale, setCurrency, toggleLocale } = localeSlice.actions;
export default localeSlice.reducer;

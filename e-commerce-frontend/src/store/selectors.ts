import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const categoriesUnionSelector = createSelector(
    [
        (state: RootState) => state.categories,
        (state: RootState) => state.variations,
        (state: RootState) => state.attributes
    ],
    (categories, variations, attributes) => ({
        categories: categories.items,
        variations: variations.items,
        attributes: attributes.items,
        loading: categories.loading || variations.loading || attributes.loading,
        error: categories.error || variations.error || attributes.error
    })
);
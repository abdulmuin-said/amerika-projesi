import { CartItemPreview } from '@/types/domains/cart';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BuyNowState {
    item: CartItemPreview | null;
}

const initialState: BuyNowState = {
    item: null,
};

const buyNowSlice = createSlice({
    name: 'buyNow',
    initialState,
    reducers: {
        setBuyNowItem: (state, action: PayloadAction<CartItemPreview>) => {
            state.item = action.payload;
        },
        clearBuyNowItem: (state) => {
            state.item = null;
        },
    },
});

export const { setBuyNowItem, clearBuyNowItem } = buyNowSlice.actions;
export default buyNowSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PromotionDetails } from '@/types/domains/promotion';
import * as promotionServices from "@/services/promotion";

interface PromotionsState {
    items: PromotionDetails[];
    loading: boolean;
    error: string | null;
}

const initialState: PromotionsState = {
    items: [],
    loading: true,
    error: null
};

export const fetchPromotions = createAsyncThunk(
    'promotions/fetchPromotions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await promotionServices.getAllPromotions();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch categories');
        }
    }
);

const promotionsSlice = createSlice({
    name: 'promotions',
    initialState,
    reducers: {
        updatePromotions: (state, action: PayloadAction<PromotionDetails[]>) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPromotions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPromotions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPromotions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updatePromotions } = promotionsSlice.actions;
export default promotionsSlice.reducer;
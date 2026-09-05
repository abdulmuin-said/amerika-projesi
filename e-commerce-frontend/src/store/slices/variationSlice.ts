import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as variationServices from "@/services/variation";
import { Variation } from '@/types/domains/variation';

interface VariationState {
    items: Variation[];
    loading: boolean;
    error: string | null;
}

const initialState: VariationState = {
    items: [],
    loading: true,
    error: null
};

export const fetchVariations = createAsyncThunk(
    'variations/fetchVariations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await variationServices.getAllVariations();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch variations!');
        }
    }
);

const variationSlice = createSlice({
    name: 'variations',
    initialState,
    reducers: {
        updateVariations: (state, action: PayloadAction<Variation[]>) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVariations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVariations.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchVariations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateVariations } = variationSlice.actions;
export default variationSlice.reducer;
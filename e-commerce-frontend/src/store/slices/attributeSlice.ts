/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as attributeServices from "@/services/attribute";
import { Attribute } from '@/types/domains/attribute';

interface AttributeState {
    items: Attribute[];
    loading: boolean;
    error: string | null;
}

const initialState: AttributeState = {
    items: [],
    loading: true,
    error: null
};

export const fetchAttributes = createAsyncThunk(
    'attributes/fetchAttributes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await attributeServices.getAllAttributes();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch attributes!');
        }
    }
);

const attributeSlice = createSlice({
    name: 'attributes',
    initialState,
    reducers: {
        updateAttributes: (state, action: PayloadAction<Attribute[]>) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttributes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttributes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAttributes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateAttributes } = attributeSlice.actions;
export default attributeSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoryTree } from '@/types/domains/category';
import * as categoryServices from "@/services/category";

interface CategoryState {
    items: CategoryTree[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: true,
    error: null
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await categoryServices.getAllCategories();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch categories!');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        updateCategories: (state, action: PayloadAction<CategoryTree[]>) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateCategories } = categorySlice.actions;
export default categorySlice.reducer;
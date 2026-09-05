import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistServices from '@/services/wishlist';
import { WishlistItemDTO } from '@/types/domains/wishlist_item';

interface WishlistState {
    items: WishlistItemDTO[];
    loading: boolean;
    error: string | null;
    currentUserId: number | null;
}

const initialState: WishlistState = {
    items: [], // Start empty - will be loaded from API
    loading: false,
    error: null,
    currentUserId: null
};

type ThunkApiConfig = { rejectValue: string };

// Fetch wishlist items from API
export const fetchWishlistItems = createAsyncThunk<WishlistItemDTO[], void, ThunkApiConfig>(
    'wishlist/fetchWishlistItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistServices.getWishlistItems();
            if (response.success)
                return response.data;
            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch wishlist items');
        }
    }
);

// Add to wishlist via API
export const addToWishlistAsync = createAsyncThunk<
    WishlistItemDTO[], 
    number,
    ThunkApiConfig
>(
    'wishlist/addToWishlistAsync',
    async (productVariantId, { dispatch, rejectWithValue }) => {
        try {
            const response = await wishlistServices.addToWishlist(productVariantId);
            if (response.success) {
                const fetchAction = await dispatch(fetchWishlistItems());
                return fetchAction.meta.requestStatus === "fulfilled" ?
                    fetchAction.payload as WishlistItemDTO[] :
                    rejectWithValue(fetchAction.payload as string);
            }
            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to wishlist');
        }
    }
);

// Remove from wishlist via API
export const removeFromWishlistAsync = createAsyncThunk<WishlistItemDTO[], number, ThunkApiConfig>(
    'wishlist/removeFromWishlistAsync',
    async (wishlistItemId, { dispatch, rejectWithValue }) => {
        try {
            const response = await wishlistServices.deleteWishlistItem(wishlistItemId);
            if (response.success) {
                const fetchAction = await dispatch(fetchWishlistItems());
                return fetchAction.meta.requestStatus === "fulfilled" ?
                    fetchAction.payload as WishlistItemDTO[] :
                    rejectWithValue(fetchAction.payload as string);
            }
            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to remove item from wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch wishlist items
            .addCase(fetchWishlistItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlistItems.fulfilled, (state, action) => {
                state.loading = false;
                // Directly use API data - no localStorage merge
                state.items = action.payload;
            })
            .addCase(fetchWishlistItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            })
            // Add to wishlist
            .addCase(addToWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(addToWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            })
            // Remove from wishlist
            .addCase(removeFromWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(removeFromWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? null;
            });
    }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

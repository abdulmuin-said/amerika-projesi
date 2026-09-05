import { CartItemDTO, CartItemPreview, CartItemUpdatePayload } from '@/types/domains/cart';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as cartServices from "@/services/cart";

interface CartState {
    items: CartItemPreview[];
    totalItems: number;
    totalAmount: number;
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: true,
    error: null
};

type ThunkApiConfig = { rejectValue: string };

export const fetchCartItems = createAsyncThunk<CartItemPreview[], void, ThunkApiConfig>(
    'cart/fetchCartItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartServices.getAllCartItems();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Failed to fetch cart items');
        }
    }
);

export const addToCart = createAsyncThunk<CartItemPreview[], CartItemDTO, ThunkApiConfig>(
    'cart/addToCartAsync',
    async (itemToAdd, { dispatch, rejectWithValue }) => {
        try {
            console.log("itemToAdd", itemToAdd);
            const response = await cartServices.addCartItem({
                productVariantId: itemToAdd.productVariantId,
                quantity: itemToAdd.quantity,
                productImageId: itemToAdd.productImageId,
                personalization: itemToAdd.personalization
            });
            if (response.success) {
                const fetchAction = await dispatch(fetchCartItems());
                return fetchAction.meta.requestStatus === "fulfilled" ?
                    fetchAction.payload as CartItemPreview[] :
                    rejectWithValue(fetchAction.payload as string);
            }

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to add item to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ cartItemId, payload }: { cartItemId: number, payload: CartItemUpdatePayload }, { rejectWithValue }) => {
        try {
            const response = await cartServices.updateCartItem(cartItemId, payload);
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to update cart item');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
    'cart/removeFromCartAsync',
    async (cartItemId, { rejectWithValue }) => {
        try {
            const response = await cartServices.deleteCartItem(cartItemId);
            if (response.success)
                return cartItemId;

            return rejectWithValue(response.error);
        } catch (error: unknown) {
            return rejectWithValue((error as { error: string }).error || 'Failed to remove item from cart');
        }
    }
);

const calculateTotals = (state: CartState) => {
    state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};



const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // addToCart: (state, action: PayloadAction<CartItemDTO>) => {
        //     state.items = [...state.items, {
        //         ...action.payload,
        //         cartItemId: ++cartItemId,
        //         imageUrl: "https://drive.google.com/uc?export=view&id=1P5LsB3Kl1wb0j_D8BrkhVJetaSRqdTMX",
        //         addedAt: new Date(),
        //         quantityInStock: 50,
        //         price: 300,
        //         sku: "KHFDJ89873",
        //         title: "Test"
        //     }];
        //     calculateTotals(state);
        // },
        updateCart: (state, action: PayloadAction<CartItemPreview[]>) => {
            state.items = action.payload;
            calculateTotals(state);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                calculateTotals(state);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCartItemAsync.pending, (state, action) => {
                // Optimistic update — reflect new quantity immediately so UI responds instantly
                const { cartItemId, payload } = action.meta.arg;
                if (payload.quantity !== undefined) {
                    const item = state.items.find(i => i.cartItemId === cartItemId);
                    if (item) {
                        item.quantity = payload.quantity;
                        calculateTotals(state);
                    }
                }
                state.error = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                // Confirm with server response
                const item = state.items.find(i => i.cartItemId === action.payload.cartItemId);
                if (item) {
                    item.quantity = action.payload.quantity;
                    item.personalization = action.payload.personalization;
                    calculateTotals(state);
                }
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.error = action.payload as string;
                // Optimistic value will be reverted by re-fetching in the component
            })
            .addCase(removeFromCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.cartItemId !== action.payload);
                calculateTotals(state);
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                if (action.payload) state.error = action.payload;
            });
    },
});

export const { updateCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
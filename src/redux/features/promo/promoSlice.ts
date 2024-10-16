'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { PromoState, Promo } from '@/types';

const initialState: PromoState = {
  loading: false,
  isFailed: false,
};

const promoSlice = createSlice({
  name: 'promo',
  initialState,
  reducers: {
    startLoading: state => {
      state.loading = true;
      state.error = undefined;
      state.isFailed = false;
    },
    stopLoading: state => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
    },
    setPromos: (state, action: PayloadAction<{ promos: Promo[] }>) => {
      state.loading = false;
      state.promos = action.payload.promos;
      state.error = undefined;
      state.isFailed = false;
    },
    setPromoDetail: (state, action: PayloadAction<{ promoDetail: Promo }>) => {
      state.loading = false;
      state.promoDetail = action.payload.promoDetail;
      state.error = undefined;
      state.isFailed = false;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.loading = false;
      state.error = action.payload;
      state.isFailed = true;
    },
    clearError: state => {
      state.error = undefined;
    },
  },
});

export const { startLoading, stopLoading, setPromos, setPromoDetail, setError, clearError } =
  promoSlice.actions;
export const selectPromo = (state: RootState) => state.promo;
export default promoSlice.reducer;

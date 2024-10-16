'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { CardState, CardDetail } from '@/types';

const initialState: CardState = {
  loading: false,
  isFailed: false,
};

const cardSlice = createSlice({
  name: 'card',
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
    setCards: (state, action: PayloadAction<{ cards: CardDetail[] }>) => {
      state.loading = false;
      state.cards = action.payload.cards;
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

export const { startLoading, stopLoading, setCards, setError, clearError } = cardSlice.actions;
export const selectCard = (state: RootState) => state.card;
export default cardSlice.reducer;

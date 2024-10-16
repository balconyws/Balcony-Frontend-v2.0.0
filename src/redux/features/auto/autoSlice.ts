'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { AutoState, Auto } from '@/types';

const initialState: AutoState = {
  loading: false,
  isFailed: false,
};

const autoSlice = createSlice({
  name: 'auto',
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
    setStatus: (state, action: PayloadAction<{ status: Auto }>) => {
      state.loading = false;
      state.status = action.payload.status;
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

export const { startLoading, stopLoading, setStatus, setError, clearError } = autoSlice.actions;
export const selectAuto = (state: RootState) => state.auto;
export default autoSlice.reducer;

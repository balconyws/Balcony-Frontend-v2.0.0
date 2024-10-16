'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { SubscriptionState, Plan, SubscriptionDetail } from '@/types';

const initialState: SubscriptionState = {
  loading: false,
  isFailed: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
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
    setPlans: (state, action: PayloadAction<{ plans: Plan[] }>) => {
      state.loading = false;
      state.plans = action.payload.plans;
      state.error = undefined;
      state.isFailed = false;
    },
    setSubscriptionDetail: (
      state,
      action: PayloadAction<{ subscriptionDetail: SubscriptionDetail }>
    ) => {
      state.loading = false;
      state.subscriptionDetail = action.payload.subscriptionDetail;
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

export const { startLoading, stopLoading, setPlans, setSubscriptionDetail, setError, clearError } =
  subscriptionSlice.actions;
export const selectSubscription = (state: RootState) => state.subscription;
export default subscriptionSlice.reducer;

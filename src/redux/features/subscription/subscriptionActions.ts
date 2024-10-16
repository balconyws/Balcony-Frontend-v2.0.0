'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { subscriptionSlice } from '@/redux';
import { SubscriptionServerActions } from '@/server';

export const getAllPlans = createAsyncThunk('subscription/getAllPlans', async (_, { dispatch }) => {
  const { startLoading, setPlans, setError } = subscriptionSlice;
  dispatch(startLoading());
  const res = await SubscriptionServerActions.GetAllPlans();
  if ('data' in res) {
    dispatch(setPlans({ plans: res.data.plans }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting all plans failed' }));
  }
});

export const purchasePlan = createAsyncThunk(
  'subscription/purchasePlan',
  async (payload: { productId: string }, { dispatch }) => {
    const { stopLoading, setError } = subscriptionSlice;
    const res = await SubscriptionServerActions.PurchasePlan(payload);
    if ('data' in res) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'purchasing plan failed' }));
    }
  }
);

export const getUserSubscriptionDetail = createAsyncThunk(
  'subscription/getUserSubscriptionDetail',
  async (_, { dispatch }) => {
    const { startLoading, setSubscriptionDetail, setError } = subscriptionSlice;
    dispatch(startLoading());
    const res = await SubscriptionServerActions.GetUserSubscriptionDetail();
    if ('data' in res) {
      dispatch(setSubscriptionDetail({ subscriptionDetail: res.data.subscription }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting user subscription detail failed' }));
    }
  }
);

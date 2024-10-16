'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { AutoServerActions } from '@/server';
import { autoSlice } from '@/redux';
import { PaymentType } from '@/types';

export const toggleAutoAcceptBooking = createAsyncThunk(
  'auto/toggleAutoAcceptBooking',
  async (_, { dispatch }) => {
    const { startLoading, setStatus, setError } = autoSlice;
    dispatch(startLoading());
    const res = await AutoServerActions.ToggleAutoAcceptBooking();
    if ('data' in res) {
      dispatch(setStatus({ status: res.data.status }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'toggling auto accept booking failed' }));
    }
  }
);

export const toggleAutoRentPay = createAsyncThunk(
  'auto/toggleAutoRentPay',
  async (
    payload: {
      tenantId: string;
      type: PaymentType;
    },
    { dispatch }
  ) => {
    const { startLoading, setStatus, setError } = autoSlice;
    dispatch(startLoading());
    const res = await AutoServerActions.ToggleAutoRentPay(payload);
    if ('data' in res) {
      dispatch(setStatus({ status: res.data.status }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'toggling auto rent pay failed' }));
    }
  }
);

export const checkStatus = createAsyncThunk('auto/checkStatus', async (_, { dispatch }) => {
  const { startLoading, setStatus, setError } = autoSlice;
  dispatch(startLoading());
  const res = await AutoServerActions.CheckStatus();
  if ('data' in res) {
    dispatch(setStatus({ status: res.data.status }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'checking status failed' }));
  }
});

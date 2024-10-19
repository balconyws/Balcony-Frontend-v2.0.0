'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { PromoType, Promo } from '@/types';
import { promoSlice, RootState } from '@/redux';
import { PromoServerActions } from '@/server';

export const createPromo = createAsyncThunk(
  'promo/createPromo',
  async (
    payload: {
      code: string;
      type: PromoType;
      discount: number;
      applicableOn: 'workspace' | 'property';
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setPromos, setError } = promoSlice;
    dispatch(startLoading());
    const res = await PromoServerActions.CreatePromo(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.promo.promos || ([] as Promo[]);
      const updatedPromos = [...prev, { ...res.data.promo }];
      dispatch(setPromos({ promos: updatedPromos }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'adding new promo failed' }));
    }
  }
);

export const updatePromo = createAsyncThunk(
  'promo/updatePromo',
  async (payload: Promo, { dispatch, getState }) => {
    const { startLoading, setPromos, setError } = promoSlice;
    dispatch(startLoading());
    const res = await PromoServerActions.UpdatePromo(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.promo.promos || ([] as Promo[]);
      const updatedPromos: Promo[] = prev.map(p =>
        p._id === payload._id
          ? {
              ...res.data.promo,
            }
          : p
      );
      dispatch(setPromos({ promos: updatedPromos }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating promo failed' }));
    }
  }
);

export const getAllPromos = createAsyncThunk('promo/getAllPromos', async (_, { dispatch }) => {
  const { startLoading, setPromos, setError } = promoSlice;
  dispatch(startLoading());
  const res = await PromoServerActions.GetAllPromos();
  if ('data' in res) {
    dispatch(setPromos({ promos: res.data.promos }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting all promos failed' }));
  }
});

export const findPromoByCode = createAsyncThunk(
  'promo/findPromoByCode',
  async (payload: { code: string }, { dispatch }) => {
    const { startLoading, setPromoDetail, setError } = promoSlice;
    dispatch(startLoading());
    const res = await PromoServerActions.FindPromoByCode(payload);
    if ('data' in res) {
      dispatch(setPromoDetail({ promoDetail: res.data.promo }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding promo failed' }));
    }
  }
);

export const getHostPromos = createAsyncThunk(
  'promo/getHostPromos',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setPromos, setError } = promoSlice;
    dispatch(startLoading());
    const res = await PromoServerActions.GetHostPromos(payload);
    if ('data' in res) {
      dispatch(setPromos({ promos: res.data.promos }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host promos failed' }));
    }
  }
);

export const deletePromo = createAsyncThunk(
  'promo/deletePromo',
  async (
    payload: {
      promoId: string;
    },
    { dispatch, getState }
  ) => {
    const { setPromos, setError } = promoSlice;
    const res = await PromoServerActions.DeletePromo(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prev = state.promo.promos || ([] as Promo[]);
      const updatedPromos = prev.filter(p => p._id !== payload.promoId);
      dispatch(setPromos({ promos: updatedPromos }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'deleting promo failed' }));
    }
  }
);

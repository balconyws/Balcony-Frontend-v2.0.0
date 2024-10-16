'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { PropertyState, Property, Pagination } from '@/types';

const initialState: PropertyState = {
  loading: false,
  isFailed: false,
  isUpdating: false,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    startLoading: state => {
      state.loading = true;
      state.error = undefined;
      state.isFailed = false;
      state.propertyDetail = undefined;
    },
    stopLoading: state => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
    },
    isUpdating: state => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = true;
    },
    setProperties: (state, action: PayloadAction<{ properties: Property[] }>) => {
      state.loading = false;
      state.properties = action.payload.properties;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
    },
    setPagination: (state, action: PayloadAction<{ pagination: Pagination }>) => {
      state.pagination = action.payload.pagination;
    },
    setPropertyDetail: (state, action: PayloadAction<{ property: Property }>) => {
      state.loading = false;
      state.propertyDetail = action.payload.property;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.loading = false;
      state.error = action.payload;
      state.isFailed = true;
      state.isUpdating = false;
    },
    clearError: state => {
      state.error = undefined;
    },
  },
});

export const {
  startLoading,
  stopLoading,
  isUpdating,
  setProperties,
  setPagination,
  setPropertyDetail,
  setError,
  clearError,
} = propertySlice.actions;
export const selectProperty = (state: RootState) => state.property;
export default propertySlice.reducer;

'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { TenantState, Tenant, Pagination, BankAccountDetail } from '@/types';

const initialState: TenantState = {
  loading: false,
  isFailed: false,
  isUpdating: false,
  isLoadingBankDetails: false,
  isViewOnly: false,
};

const tenantSlice = createSlice({
  name: 'tenant',
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
      state.isUpdating = false;
    },
    isUpdating: state => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = true;
    },
    isLoadingBankDetails: state => {
      state.isLoadingBankDetails = true;
    },
    setTenants: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.tenants = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setAwaiting: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.awaiting = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setRenting: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.renting = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setHistory: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.history = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setProspectTenants: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.prospectTenants = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setAwaitingRents: (state, action: PayloadAction<{ tenants: Tenant[] }>) => {
      state.loading = false;
      state.awaitingRents = action.payload.tenants;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = false;
    },
    setPagination: (state, action: PayloadAction<{ pagination: Pagination }>) => {
      state.pagination = action.payload.pagination;
    },
    setTenantDetail: (state, action: PayloadAction<{ tenant: Tenant; isViewOnly?: boolean }>) => {
      state.loading = false;
      state.tenantDetail = action.payload.tenant;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.isViewOnly = action.payload.isViewOnly ?? false;
    },
    setStripeClientSecret: (state, action: PayloadAction<{ stripeClientSecret: string }>) => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.stripeClientSecret = action.payload.stripeClientSecret;
    },
    setBankAccount: (state, action: PayloadAction<{ account?: BankAccountDetail }>) => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
      state.bankAccount = action.payload.account;
      state.isLoadingBankDetails = false;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.loading = false;
      state.error = action.payload;
      state.isFailed = true;
      state.isLoadingBankDetails = false;
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
  isLoadingBankDetails,
  setTenants,
  setAwaiting,
  setRenting,
  setHistory,
  setProspectTenants,
  setAwaitingRents,
  setPagination,
  setTenantDetail,
  setStripeClientSecret,
  setBankAccount,
  setError,
  clearError,
} = tenantSlice.actions;
export const selectTenant = (state: RootState) => state.tenant;
export default tenantSlice.reducer;

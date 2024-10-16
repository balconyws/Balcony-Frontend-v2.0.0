'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import { TenantServerActions } from '@/server';
import { tenantSlice, RootState } from '@/redux';
import { encrypt } from '@/hash/client';
import { Tenant, Sort, PaymentType, Status, HostTenantsType, UserAsTenantType } from '@/types';

export const applyForTenancy = createAsyncThunk(
  'tenant/applyForTenancy',
  async (
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      selectedUnitId: string;
      moveInRequest: string;
      socialSecurityNo?: string;
      note?: string;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.ApplyForTenancy(payload);
    if ('data' in res && res.data.success) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'applying for tenancy failed' }));
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenant/updateTenant',
  async (
    payload: {
      tenantId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      selectedUnitId: string;
      moveInRequest: string;
      socialSecurityNo?: string;
      note?: string;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.UpdateTenant(payload);
    if ('data' in res && res.data.success) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating tenant failed' }));
    }
  }
);

export const updateStatus = createAsyncThunk(
  'tenant/updateStatus',
  async (
    payload: {
      tenantId: string;
      status: Status;
    },
    { dispatch, getState }
  ) => {
    const { isUpdating, setTenants, setError } = tenantSlice;
    dispatch(isUpdating());
    const res = await TenantServerActions.UpdateStatus(payload);
    if ('data' in res) {
      if (res.data.success) {
        const state = getState() as RootState;
        const prev = state.tenant.tenants || ([] as Tenant[]);
        const updatedTenant: Tenant[] = prev.map(t =>
          t._id === payload.tenantId
            ? {
                ...t,
                status: payload.status,
              }
            : t
        );
        dispatch(setTenants({ tenants: updatedTenant }));
      } else {
        dispatch(setError({ key: '', message: 'updating status of tenant failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating status of workspace failed' }));
    }
  }
);

export const approveTenant = createAsyncThunk(
  'tenant/approveTenant',
  async (
    payload: {
      tenantId: string;
      leaseStartDate: string;
      leaseEndDate: string;
      securityDepositFee?: number;
      isSameAsRent?: boolean;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setProspectTenants, setAwaitingRents, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.ApproveTenant(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prevProspectTenants = state.tenant.prospectTenants || ([] as Tenant[]);
      const prevAwaitingRents = state.tenant.awaitingRents || ([] as Tenant[]);
      const approvedTenant = prevProspectTenants.find(t => t._id === payload.tenantId);
      const updatedProspectTenants = prevProspectTenants.filter(t => t._id !== payload.tenantId);
      dispatch(setProspectTenants({ tenants: updatedProspectTenants }));
      if (approvedTenant) {
        dispatch(
          setAwaitingRents({
            tenants: [...prevAwaitingRents, { ...approvedTenant, acceptance: 'approved' }],
          })
        );
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'approving tenant failed' }));
    }
  }
);

export const rejectTenant = createAsyncThunk(
  'tenant/rejectTenant',
  async (
    payload: {
      tenantId: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setProspectTenants, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.RejectTenant(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prevProspectTenants = state.tenant.prospectTenants || ([] as Tenant[]);
      const updatedProspectTenants = prevProspectTenants.filter(t => t._id !== payload.tenantId);
      dispatch(setProspectTenants({ tenants: updatedProspectTenants }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'rejecting tenant failed' }));
    }
  }
);

export const tenantPayment = createAsyncThunk(
  'tenant/tenantPayment',
  async (
    payload: {
      tenantId: string;
      type: PaymentType;
      promoCode?: string;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setStripeClientSecret, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.TenantPayment(payload);
    if ('data' in res && res.data.success) {
      if (payload.type === 'ach') {
        dispatch(setStripeClientSecret({ stripeClientSecret: res.data.clientSecret }));
      } else {
        dispatch(stopLoading());
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'tenant payment failed' }));
    }
  }
);

export const addBankAccount = createAsyncThunk(
  'tenant/addBankAccount',
  async (payload: { tenantId: string; token: string }, { dispatch }) => {
    const { isLoadingBankDetails, setBankAccount, setError } = tenantSlice;
    dispatch(isLoadingBankDetails());
    const crypto = encrypt(payload);
    Cookies.set('tmp', crypto, { expires: 1 / 1440 }); // 1 minute
    const res = await TenantServerActions.AddBankAccount(payload);
    if ('data' in res) {
      dispatch(setBankAccount({ account: res.data.account }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'adding new bank account failed' }));
    }
  }
);

export const getBankAccount = createAsyncThunk('tenant/getBankAccount', async (_, { dispatch }) => {
  const { setBankAccount, setError } = tenantSlice;
  const res = await TenantServerActions.GetBankAccount();
  if ('data' in res) {
    dispatch(setBankAccount({ account: res.data.account }));
  } else if ('error' in res) {
    dispatch(setBankAccount({ account: undefined }));
  } else {
    dispatch(setError({ key: '', message: 'getting bank account failed' }));
  }
});

export const tenantRenew = createAsyncThunk(
  'tenant/tenantRenew',
  async (
    payload: {
      tenantId: string;
      leaseStartDate: string;
      leaseEndDate: string;
      rent?: number;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.TenantRenew(payload);
    if ('data' in res && res.data.success) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'tenant renewing failed' }));
    }
  }
);

export const tenantRefund = createAsyncThunk(
  'tenant/tenantRefund',
  async (
    payload: {
      tenantId: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setTenants, setAwaitingRents, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.TenantRefund(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prevAwaitingRents = state.tenant.awaitingRents || ([] as Tenant[]);
      const prevTenants = state.tenant.tenants || ([] as Tenant[]);
      const refundedTenant = prevAwaitingRents.find(t => t._id === payload.tenantId);
      const updatedAwaitingRents = prevAwaitingRents.filter(t => t._id !== payload.tenantId);
      dispatch(setAwaitingRents({ tenants: updatedAwaitingRents }));
      if (refundedTenant) {
        const updatedTenant: Tenant = {
          ...refundedTenant,
          agreement: refundedTenant.agreement
            ? {
                ...refundedTenant.agreement,
                isRefunded: true,
              }
            : undefined,
        };
        dispatch(
          setTenants({
            tenants: [...prevTenants, updatedTenant],
          })
        );
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'tenant refunding failed' }));
    }
  }
);

export const getAllTenants = createAsyncThunk(
  'tenant/getAllTenants',
  async (
    payload: {
      query?: object;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeSelectedUnit?: boolean;
      includeProperty?: boolean;
      includeHost?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setProspectTenants, setTenants, setPagination, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.GetAllTenants(payload);
    if ('data' in res) {
      const { result, ...pagination } = res.data;
      const prospectTenants = result.filter((tenant: Tenant) => tenant.acceptance === 'pending');
      const tenants = result.filter((tenant: Tenant) => tenant.acceptance !== 'pending');
      dispatch(setProspectTenants({ tenants: prospectTenants }));
      dispatch(setTenants({ tenants }));
      dispatch(setPagination({ pagination }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all tenants failed' }));
    }
  }
);

export const getHostTenants = createAsyncThunk(
  'tenant/getHostTenants',
  async (
    payload: {
      hostId: string;
      status?: HostTenantsType | HostTenantsType[];
    },
    { dispatch }
  ) => {
    const { startLoading, setProspectTenants, setTenants, setAwaitingRents, setError } =
      tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.GetHostTenants(payload);
    if ('data' in res) {
      if (payload.status === 'pending requests') {
        dispatch(setProspectTenants({ tenants: res.data.tenants }));
      } else if (payload.status === 'awaiting payments') {
        dispatch(setAwaitingRents({ tenants: res.data.tenants }));
      } else if (payload.status === 'current tenants') {
        dispatch(setTenants({ tenants: res.data.tenants }));
      } else {
        dispatch(setTenants({ tenants: res.data.tenants }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all host tenants failed' }));
    }
  }
);

export const getUserAsTenants = createAsyncThunk(
  'tenant/getUserAsTenants',
  async (
    payload: {
      status?: UserAsTenantType | UserAsTenantType[];
    },
    { dispatch }
  ) => {
    const { startLoading, setAwaiting, setRenting, setHistory, setTenants, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.GetUserAsTenants(payload);
    if ('data' in res) {
      if (payload.status === 'awaiting') {
        dispatch(setAwaiting({ tenants: res.data.tenants }));
      } else if (payload.status === 'renting') {
        dispatch(setRenting({ tenants: res.data.tenants }));
      } else if (payload.status === 'history') {
        dispatch(setHistory({ tenants: res.data.tenants }));
      } else {
        dispatch(setTenants({ tenants: res.data.tenants }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all user tenants failed' }));
    }
  }
);

export const findTenant = createAsyncThunk(
  'tenant/findTenant',
  async (payload: { tenantId: string }, { dispatch }) => {
    const { startLoading, setTenantDetail, setError } = tenantSlice;
    dispatch(startLoading());
    const res = await TenantServerActions.FindTenantById(payload);
    if ('data' in res) {
      dispatch(setTenantDetail({ tenant: res.data.tenant }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding tenant failed' }));
    }
  }
);

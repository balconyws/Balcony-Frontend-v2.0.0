'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { AuthState, User } from '@/types';

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  otpDialog: { show: false, expiryTime: undefined, isResetRequest: undefined },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: state => {
      state.loading = true;
      state.isAuthenticated = false;
      state.error = undefined;
    },
    stopLoading: state => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = undefined;
    },
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isReAuthenticate = false;
    },
    setUser: (state, action: PayloadAction<{ user: User }>) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload.user;
      state.isReAuthenticate = false;
    },
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = undefined;
      state.token = action.payload.token;
    },
    setLoading: (state, action: PayloadAction<{ state: boolean }>) => {
      state.loading = action.payload.state;
    },
    authError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: state => {
      state.error = undefined;
    },
    setOtpDialog: (
      state,
      action: PayloadAction<{ show: boolean; expiryTime?: number; isResetRequest?: boolean }>
    ) => {
      state.otpDialog = action.payload;
    },
    setResetDialog: (state, action: PayloadAction<{ show: boolean }>) => {
      state.resetDialog = action.payload.show;
    },
    setReAuthenticate: (state, action: PayloadAction<{ reauthenticate: boolean }>) => {
      state.isReAuthenticate = action.payload.reauthenticate;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = undefined;
      state.token = undefined;
      state.error = undefined;
    },
  },
});

export const {
  startLoading,
  stopLoading,
  login,
  setUser,
  setToken,
  setLoading,
  authError,
  setError,
  clearError,
  setOtpDialog,
  setResetDialog,
  setReAuthenticate,
  logout,
} = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;

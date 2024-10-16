'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { UserState, User, Balance } from '@/types';

const initialState: UserState = {
  loading: false,
  isFailed: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoading: state => {
      state.loading = true;
      state.error = undefined;
      state.isFailed = false;
      state.userDetail = undefined;
    },
    stopLoading: state => {
      state.loading = false;
      state.error = undefined;
      state.isFailed = false;
    },
    setUsers: (state, action: PayloadAction<{ users: User[] }>) => {
      state.loading = false;
      state.users = action.payload.users;
      state.error = undefined;
      state.isFailed = false;
    },
    setHost: (state, action: PayloadAction<{ host: User[] }>) => {
      state.loading = false;
      state.host = action.payload.host;
      state.error = undefined;
      state.isFailed = false;
    },
    setUserDetail: (state, action: PayloadAction<{ user: User }>) => {
      state.loading = false;
      state.userDetail = action.payload.user;
      state.error = undefined;
      state.isFailed = false;
    },
    setBalance: (state, action: PayloadAction<{ balance: Balance }>) => {
      state.loading = false;
      state.balance = action.payload.balance;
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

export const {
  startLoading,
  stopLoading,
  setUsers,
  setHost,
  setUserDetail,
  setBalance,
  setError,
  clearError,
} = userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer;

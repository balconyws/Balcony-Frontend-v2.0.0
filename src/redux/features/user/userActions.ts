'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { RootState, userSlice } from '@/redux';
import { UserServerActions } from '@/server';
import { Status, User } from '@/types';

export const updateStatus = createAsyncThunk(
  'user/updateStatus',
  async (
    payload: {
      userId: string;
      status: Status;
    },
    { dispatch, getState }
  ) => {
    const { setUsers, setHost, setError } = userSlice;
    const res = await UserServerActions.UpdateStatus(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prevUsers = state.user.users || ([] as User[]);
      const prevHost = state.user.host || ([] as User[]);
      const updatedUsers: User[] = prevUsers.map(u =>
        u._id === payload.userId
          ? {
              ...u,
              status: payload.status,
            }
          : u
      );
      const updatedHost: User[] = prevHost.map(h =>
        h._id === payload.userId
          ? {
              ...h,
              status: payload.status,
            }
          : h
      );
      dispatch(setUsers({ users: updatedUsers }));
      dispatch(setHost({ host: updatedHost }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'user update failed' }));
    }
  }
);

export const getAllUsers = createAsyncThunk('user/getAllUsers', async (_, { dispatch }) => {
  const { startLoading, setUsers, setHost, setError } = userSlice;
  dispatch(startLoading());
  const res = await UserServerActions.GetAllUsers();
  if ('data' in res) {
    const users = res.data.users.filter(user => user.role === 'user');
    const host = res.data.users.filter(user => user.role === 'host');
    dispatch(setUsers({ users }));
    dispatch(setHost({ host }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting all users failed' }));
  }
});

export const findUser = createAsyncThunk(
  'user/findUser',
  async (payload: { userId: string }, { dispatch }) => {
    const { startLoading, setUserDetail, setError } = userSlice;
    dispatch(startLoading());
    const res = await UserServerActions.FindUserById(payload);
    if ('data' in res) {
      dispatch(setUserDetail({ user: res.data.user }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding user failed' }));
    }
  }
);

export const getHostBalance = createAsyncThunk(
  'user/getHostBalance',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setBalance, setError } = userSlice;
    dispatch(startLoading());
    const res = await UserServerActions.GetHostBalance(payload);
    if ('data' in res) {
      dispatch(setBalance({ balance: res.data.balance }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host balance failed' }));
    }
  }
);

export const getAdminBalance = createAsyncThunk('user/getAdminBalance', async (_, { dispatch }) => {
  const { startLoading, setBalance, setError } = userSlice;
  dispatch(startLoading());
  const res = await UserServerActions.GetAdminBalance();
  if ('data' in res) {
    dispatch(setBalance({ balance: res.data.balance }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting admin balance failed' }));
  }
});

'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { WorkspaceState, Workspace, Pagination } from '@/types';

const initialState: WorkspaceState = {
  loading: false,
  isFailed: false,
  isUpdating: false,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    startLoading: state => {
      state.loading = true;
      state.error = undefined;
      state.isFailed = false;
      state.workspaceDetail = undefined;
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
    setWorkspaces: (state, action: PayloadAction<{ workspaces: Workspace[] }>) => {
      state.loading = false;
      state.workspaces = action.payload.workspaces;
      state.error = undefined;
      state.isFailed = false;
      state.isUpdating = false;
    },
    setPagination: (state, action: PayloadAction<{ pagination: Pagination }>) => {
      state.pagination = action.payload.pagination;
    },
    setWorkspaceDetail: (state, action: PayloadAction<{ workspace: Workspace }>) => {
      state.loading = false;
      state.workspaceDetail = action.payload.workspace;
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
  setWorkspaces,
  setPagination,
  setWorkspaceDetail,
  setError,
  clearError,
} = workspaceSlice.actions;
export const selectWorkspace = (state: RootState) => state.workspace;
export default workspaceSlice.reducer;

'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Sort, Status, Workspace } from '@/types';
import { RootState, workspaceSlice } from '@/redux';
import { WorkspaceServerActions } from '@/server';

export const addWorkspace = createAsyncThunk(
  'workspace/addWorkspace',
  async (formData: FormData, { dispatch }) => {
    const { startLoading, stopLoading, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.AddWorkspace(formData);
    if ('data' in res) {
      if (res.data.success) {
        dispatch(stopLoading());
      } else {
        dispatch(setError({ key: '', message: 'adding new workspace failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'adding new workspace failed' }));
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async (formData: FormData, { dispatch }) => {
    const { startLoading, stopLoading, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.UpdateWorkspace(formData);
    if ('data' in res) {
      if (res.data.success) {
        dispatch(stopLoading());
      } else {
        dispatch(setError({ key: '', message: 'updating workspace failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating workspace failed' }));
    }
  }
);

export const updateStatus = createAsyncThunk(
  'workspace/updateStatus',
  async (
    payload: {
      workspaceId: string;
      status: Status;
    },
    { dispatch, getState }
  ) => {
    const { isUpdating, setWorkspaces, setError } = workspaceSlice;
    dispatch(isUpdating());
    const res = await WorkspaceServerActions.UpdateStatus(payload);
    if ('data' in res) {
      if (res.data.success) {
        const state = getState() as RootState;
        const prev = state.workspace.workspaces || ([] as Workspace[]);
        const updatedWorkspaces: Workspace[] = prev.map(w =>
          w._id === payload.workspaceId
            ? {
                ...w,
                status: payload.status,
              }
            : w
        );
        dispatch(setWorkspaces({ workspaces: updatedWorkspaces }));
      } else {
        dispatch(setError({ key: '', message: 'updating status of workspace failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating status of workspace failed' }));
    }
  }
);

export const getAllWorkspaces = createAsyncThunk(
  'workspace/getAllWorkspaces',
  async (
    payload: {
      query?: object;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeHost?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setWorkspaces, setPagination, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.GetAllWorkspaces(payload);
    if ('data' in res) {
      const { result, ...pagination } = res.data;
      dispatch(setWorkspaces({ workspaces: result }));
      dispatch(setPagination({ pagination }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all workspaces failed' }));
    }
  }
);

export const searchWorkspaces = createAsyncThunk(
  'workspace/searchWorkspaces',
  async (
    payload: {
      place?: string;
      checkin?: string;
      checkout?: string;
      people?: string;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeHost?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setWorkspaces, setPagination, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.SearchWorkspaces(payload);
    if ('data' in res) {
      const { result, ...pagination } = res.data;
      dispatch(setWorkspaces({ workspaces: result }));
      dispatch(setPagination({ pagination }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'searching workspaces failed' }));
    }
  }
);

export const findWorkspace = createAsyncThunk(
  'workspace/findWorkspace',
  async (payload: { workspaceId: string }, { dispatch }) => {
    const { startLoading, setWorkspaceDetail, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.FindWorkspaceById(payload);
    if ('data' in res) {
      dispatch(setWorkspaceDetail({ workspace: res.data.workspace }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding workspace failed' }));
    }
  }
);

export const getHostWorkspaces = createAsyncThunk(
  'workspace/getHostWorkspaces',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setWorkspaces, setError } = workspaceSlice;
    dispatch(startLoading());
    const res = await WorkspaceServerActions.GetHostWorkspaces(payload);
    if ('data' in res) {
      dispatch(setWorkspaces({ workspaces: res.data.workspaces }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host workspaces failed' }));
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (
    payload: {
      workspaceId: string;
    },
    { dispatch, getState }
  ) => {
    const { setWorkspaces, setError } = workspaceSlice;
    const res = await WorkspaceServerActions.DeleteWorkspace(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.workspace.workspaces || ([] as Workspace[]);
      const updatedWorkspaces = prev.filter(w => w._id !== payload.workspaceId);
      dispatch(setWorkspaces({ workspaces: updatedWorkspaces }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'deleting workspace failed' }));
    }
  }
);

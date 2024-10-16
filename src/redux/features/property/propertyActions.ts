'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Sort, Status, Property } from '@/types';
import { propertySlice, RootState } from '@/redux';
import { PropertyServerActions } from '@/server';

export const addProperty = createAsyncThunk(
  'property/addProperty',
  async (formData: FormData, { dispatch }) => {
    const { startLoading, stopLoading, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.AddProperty(formData);
    if ('data' in res) {
      if (res.data.success) {
        dispatch(stopLoading());
      } else {
        dispatch(setError({ key: '', message: 'adding new property failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'adding new property failed' }));
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async (formData: FormData, { dispatch }) => {
    const { startLoading, stopLoading, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.UpdateProperty(formData);
    if ('data' in res) {
      if (res.data.success) {
        dispatch(stopLoading());
      } else {
        dispatch(setError({ key: '', message: 'updating property failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating property failed' }));
    }
  }
);

export const updateStatus = createAsyncThunk(
  'property/updateStatus',
  async (
    payload: {
      propertyId: string;
      status: Status;
    },
    { dispatch, getState }
  ) => {
    const { isUpdating, setProperties, setError } = propertySlice;
    dispatch(isUpdating());
    const res = await PropertyServerActions.UpdateStatus(payload);
    if ('data' in res) {
      if (res.data.success) {
        const state = getState() as RootState;
        const prev = state.property.properties || ([] as Property[]);
        const updatedProperties: Property[] = prev.map(p =>
          p._id === payload.propertyId
            ? {
                ...p,
                status: payload.status,
              }
            : p
        );
        dispatch(setProperties({ properties: updatedProperties }));
      } else {
        dispatch(setError({ key: '', message: 'updating property failed' }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating property failed' }));
    }
  }
);

export const getAllProperties = createAsyncThunk(
  'property/getAllProperties',
  async (
    payload: {
      query?: object;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeHost?: boolean;
      includeUnitList?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setProperties, setPagination, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.GetAllProperties(payload);
    if ('data' in res) {
      const { result, ...pagination } = res.data;
      dispatch(setProperties({ properties: result }));
      dispatch(setPagination({ pagination }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all properties failed' }));
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (
    payload: {
      place?: string;
      beds?: string;
      baths?: string;
      minrange?: string;
      maxrange?: string;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeHost?: boolean;
      includeUnitList?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setProperties, setPagination, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.SearchProperties(payload);
    if ('data' in res) {
      const { result, ...pagination } = res.data;
      dispatch(setProperties({ properties: result }));
      dispatch(setPagination({ pagination }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'searching properties failed' }));
    }
  }
);

export const findProperty = createAsyncThunk(
  'property/findProperty',
  async (payload: { propertyId: string }, { dispatch }) => {
    const { startLoading, setPropertyDetail, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.FindPropertyById(payload);
    if ('data' in res) {
      dispatch(setPropertyDetail({ property: res.data.property }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding property failed' }));
    }
  }
);

export const getHostProperties = createAsyncThunk(
  'property/getHostProperties',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setProperties, setError } = propertySlice;
    dispatch(startLoading());
    const res = await PropertyServerActions.GetHostProperties(payload);
    if ('data' in res) {
      dispatch(setProperties({ properties: res.data.properties }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host properties failed' }));
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (
    payload: {
      propertyId: string;
    },
    { dispatch, getState }
  ) => {
    const { setProperties, setError } = propertySlice;
    const res = await PropertyServerActions.DeleteProperty(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.property.properties || ([] as Property[]);
      const updatedProperties = prev.filter(p => p._id !== payload.propertyId);
      dispatch(setProperties({ properties: updatedProperties }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'deleting property failed' }));
    }
  }
);

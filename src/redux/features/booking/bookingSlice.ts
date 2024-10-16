'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { BookingState, Booking, Pagination } from '@/types';

const initialState: BookingState = {
  loading: false,
  isFailed: false,
};

const bookingSlice = createSlice({
  name: 'booking',
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
    },
    setBookings: (state, action: PayloadAction<{ bookings: Booking[] }>) => {
      state.loading = false;
      state.bookings = action.payload.bookings;
      state.error = undefined;
      state.isFailed = false;
    },
    setInProgress: (state, action: PayloadAction<{ bookings: Booking[] }>) => {
      state.loading = false;
      state.inProgress = action.payload.bookings;
      state.error = undefined;
      state.isFailed = false;
    },
    setHistory: (state, action: PayloadAction<{ bookings: Booking[] }>) => {
      state.loading = false;
      state.history = action.payload.bookings;
      state.error = undefined;
      state.isFailed = false;
    },
    setPagination: (state, action: PayloadAction<{ pagination: Pagination }>) => {
      state.pagination = action.payload.pagination;
    },
    setBookingDetail: (state, action: PayloadAction<{ booking: Booking }>) => {
      state.loading = false;
      state.bookingDetail = action.payload.booking;
      state.error = undefined;
      state.isFailed = false;
    },
    setBookedDates: (state, action: PayloadAction<{ dates: Date[] }>) => {
      state.loading = false;
      state.bookedDates = action.payload.dates;
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
  setBookings,
  setInProgress,
  setHistory,
  setPagination,
  setBookingDetail,
  setBookedDates,
  setError,
  clearError,
} = bookingSlice.actions;
export const selectBooking = (state: RootState) => state.booking;
export default bookingSlice.reducer;

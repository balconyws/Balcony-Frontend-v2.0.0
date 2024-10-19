'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Booking, OrderStatus, PromoType, Sort } from '@/types';
import { BookingServerActions } from '@/server';
import { bookingSlice, RootState } from '@/redux';

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (
    payload: {
      workspaceId: string;
      startDate: string;
      endDate: string;
      promoCode?: string;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.CreateBooking(payload);
    if ('data' in res && res.data.success) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'creating new booking failed' }));
    }
  }
);

export const acceptBooking = createAsyncThunk(
  'booking/acceptBooking',
  async (
    payload: {
      bookingId: string;
    },
    { dispatch, getState }
  ) => {
    const { setInProgress, setError } = bookingSlice;
    const res = await BookingServerActions.AcceptBooking(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prev = state.booking.inProgress || ([] as Booking[]);
      const updatedBooking: Booking[] = prev.map(b =>
        b._id === payload.bookingId
          ? {
              ...b,
              acceptance: 'manually accepted',
              status: 'in progress',
            }
          : b
      );
      dispatch(setInProgress({ bookings: updatedBooking }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'accepting booking failed' }));
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/rejectBooking',
  async (
    payload: {
      bookingId: string;
    },
    { dispatch, getState }
  ) => {
    const { setInProgress, setHistory, setError } = bookingSlice;
    const res = await BookingServerActions.RejectBooking(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const inProgressBookings = state.booking.inProgress || ([] as Booking[]);
      const historyBookings = state.booking.history || ([] as Booking[]);
      const rejectedBooking = inProgressBookings.find(b => b._id === payload.bookingId);
      if (rejectedBooking) {
        const updatedRejectedBooking: Booking = {
          ...rejectedBooking,
          acceptance: 'rejected',
          status: 'canceled',
        };
        const updatedInProgress = inProgressBookings.filter(b => b._id !== payload.bookingId);
        const updatedHistory = [...historyBookings, updatedRejectedBooking];
        dispatch(setInProgress({ bookings: updatedInProgress }));
        dispatch(setHistory({ bookings: updatedHistory }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'rejecting booking failed' }));
    }
  }
);

export const getUserInProgressBookings = createAsyncThunk(
  'booking/getUserInProgressBookings',
  async (_, { dispatch }) => {
    const { startLoading, setInProgress, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetUserBookings({ status: ['pending', 'in progress'] });
    if ('data' in res) {
      dispatch(setInProgress({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting user in progress bookings failed' }));
    }
  }
);

export const getUserHistoryBookings = createAsyncThunk(
  'booking/getUserHistoryBookings',
  async (_, { dispatch }) => {
    const { startLoading, setHistory, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetUserBookings({
      status: ['done', 'partially refunded', 'canceled'],
    });
    if ('data' in res) {
      dispatch(setHistory({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting user history bookings failed' }));
    }
  }
);

export const getHostInProgressBookings = createAsyncThunk(
  'booking/getHostInProgressBookings',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setInProgress, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetHostBookings({
      hostId: payload.hostId,
      status: ['pending', 'in progress'],
    });
    if ('data' in res) {
      dispatch(setInProgress({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host in progress bookings failed' }));
    }
  }
);

export const getHostHistoryBookings = createAsyncThunk(
  'booking/getHostHistoryBookings',
  async (payload: { hostId: string }, { dispatch }) => {
    const { startLoading, setHistory, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetHostBookings({
      hostId: payload.hostId,
      status: ['done', 'partially refunded', 'canceled'],
    });
    if ('data' in res) {
      dispatch(setHistory({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host history bookings failed' }));
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (
    payload: {
      status?: OrderStatus | OrderStatus[];
    },
    { dispatch }
  ) => {
    const { startLoading, setBookings, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetUserBookings(payload);
    if ('data' in res) {
      dispatch(setBookings({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting user bookings failed' }));
    }
  }
);

export const getHostBookings = createAsyncThunk(
  'booking/getHostBookings',
  async (
    payload: {
      hostId: string;
      status?: OrderStatus | OrderStatus[];
    },
    { dispatch }
  ) => {
    const { startLoading, setBookings, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetHostBookings(payload);
    if ('data' in res) {
      dispatch(setBookings({ bookings: res.data.bookings }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting host bookings failed' }));
    }
  }
);

export const getAllBookings = createAsyncThunk(
  'booking/getAllBookings',
  async (
    payload: {
      query?: object;
      page?: number;
      limit?: number;
      sort?: Sort;
      select?: string;
      includeHost?: boolean;
      includeWorkspace?: boolean;
    },
    { dispatch }
  ) => {
    const { startLoading, setInProgress, setHistory, setError } = bookingSlice;
    dispatch(startLoading());
    const res1 = await BookingServerActions.GetAllBookings({
      ...payload,
      query: { ...payload.query, status: ['pending', 'in progress'] },
    });
    const res2 = await BookingServerActions.GetAllBookings({
      ...payload,
      query: { ...payload.query, status: ['done', 'partially refunded', 'canceled'] },
    });
    if ('data' in res1) {
      dispatch(setInProgress({ bookings: res1.data.result }));
    } else if ('error' in res1) {
      dispatch(setError({ key: res1.error.key, message: res1.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all bookings failed' }));
    }
    if ('data' in res2) {
      dispatch(setHistory({ bookings: res2.data.result }));
    } else if ('error' in res2) {
      dispatch(setError({ key: res2.error.key, message: res2.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all bookings failed' }));
    }
  }
);

export const findBooking = createAsyncThunk(
  'booking/findBooking',
  async (payload: { bookingId: string }, { dispatch }) => {
    const { startLoading, setBookingDetail, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.FindBookingById(payload);
    if ('data' in res) {
      dispatch(setBookingDetail({ booking: res.data.booking }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'finding booking failed' }));
    }
  }
);

export const getBookedDates = createAsyncThunk(
  'booking/getBookedDates',
  async (_, { dispatch }) => {
    const { startLoading, setBookedDates, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.GetBookedDates();
    if ('data' in res) {
      dispatch(setBookedDates({ dates: res.data.dates }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting booked dates failed' }));
    }
  }
);

export const refundBooking = createAsyncThunk(
  'booking/refundBooking',
  async (
    payload: {
      bookingId: string;
      amount: number;
      type: PromoType;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setInProgress, setHistory, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.RefundBooking(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const inProgressBookings = state.booking.inProgress || ([] as Booking[]);
      const historyBookings = state.booking.history || ([] as Booking[]);
      const refundedBooking = inProgressBookings.find(b => b._id === payload.bookingId);
      if (refundedBooking) {
        const updatedRefundedBooking: Booking = {
          ...refundedBooking,
          status: 'partially refunded',
        };
        const updatedInProgress = inProgressBookings.filter(b => b._id !== payload.bookingId);
        const updatedHistory = [...historyBookings, updatedRefundedBooking];
        dispatch(setInProgress({ bookings: updatedInProgress }));
        dispatch(setHistory({ bookings: updatedHistory }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'refunding booking failed' }));
    }
  }
);

export const cancelBookingByHost = createAsyncThunk(
  'booking/cancelBookingByHost',
  async (
    payload: {
      bookingId: string;
    },
    { dispatch, getState }
  ) => {
    const { setInProgress, setHistory, setError } = bookingSlice;
    const res = await BookingServerActions.CancelBookingByHost(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const inProgressBookings = state.booking.inProgress || ([] as Booking[]);
      const historyBookings = state.booking.history || ([] as Booking[]);
      const canceledBooking = inProgressBookings.find(b => b._id === payload.bookingId);
      if (canceledBooking) {
        const updatedCanceledBooking: Booking = {
          ...canceledBooking,
          status: 'canceled',
        };
        const updatedInProgress = inProgressBookings.filter(b => b._id !== payload.bookingId);
        const updatedHistory = [...historyBookings, updatedCanceledBooking];
        dispatch(setInProgress({ bookings: updatedInProgress }));
        dispatch(setHistory({ bookings: updatedHistory }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'cancelling booking failed' }));
    }
  }
);

export const cancelBookingByUser = createAsyncThunk(
  'booking/cancelBookingByUser',
  async (
    payload: {
      bookingId: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setInProgress, setError } = bookingSlice;
    dispatch(startLoading());
    const res = await BookingServerActions.CancelBookingByUser(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prev = state.booking.inProgress || ([] as Booking[]);
      const updatedBooking: Booking[] = prev.map(b =>
        b._id === payload.bookingId
          ? {
              ...b,
              status: 'canceled',
            }
          : b
      );
      dispatch(setInProgress({ bookings: updatedBooking }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'cancelling booking failed' }));
    }
  }
);

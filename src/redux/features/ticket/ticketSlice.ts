'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { TicketState, Ticket } from '@/types';

const initialState: TicketState = {
  loading: false,
  isFailed: false,
};

const ticketSlice = createSlice({
  name: 'ticket',
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
    setTickets: (state, action: PayloadAction<{ tickets: Ticket[] }>) => {
      state.loading = false;
      state.tickets = action.payload.tickets;
      state.error = undefined;
      state.isFailed = false;
    },
    setHistory: (state, action: PayloadAction<{ history: Ticket[] }>) => {
      state.loading = false;
      state.history = action.payload.history;
      state.error = undefined;
      state.isFailed = false;
    },
    setTicketDetail: (state, action: PayloadAction<{ ticketDetail: Ticket | undefined }>) => {
      state.loading = false;
      state.ticketDetail = action.payload.ticketDetail;
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
  setTickets,
  setHistory,
  setTicketDetail,
  setError,
  clearError,
} = ticketSlice.actions;
export const selectTicket = (state: RootState) => state.ticket;
export default ticketSlice.reducer;

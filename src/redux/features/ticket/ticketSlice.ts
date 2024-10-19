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
    setTicketsType: (state, action: PayloadAction<{ ticketType: 'workspaces' | 'properties' }>) => {
      state.ticketsType = action.payload.ticketType;
    },
    setUserTickets: (
      state,
      action: PayloadAction<{
        userTickets: {
          tickets: Ticket[];
          history: Ticket[];
        };
      }>
    ) => {
      state.loading = false;
      state.userTickets = action.payload.userTickets;
      state.error = undefined;
      state.isFailed = false;
    },
    setWorkspaceTickets: (
      state,
      action: PayloadAction<{
        workspaceTickets: {
          tickets: Ticket[];
          history: Ticket[];
        };
      }>
    ) => {
      state.loading = false;
      state.workspaceTickets = action.payload.workspaceTickets;
      state.error = undefined;
      state.isFailed = false;
    },
    setPropertyTickets: (
      state,
      action: PayloadAction<{
        propertyTickets: {
          tickets: Ticket[];
          history: Ticket[];
        };
      }>
    ) => {
      state.loading = false;
      state.propertyTickets = action.payload.propertyTickets;
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
  setUserTickets,
  setWorkspaceTickets,
  setPropertyTickets,
  setTicketDetail,
  setTicketsType,
  setError,
  clearError,
} = ticketSlice.actions;
export const selectTicket = (state: RootState) => state.ticket;
export default ticketSlice.reducer;

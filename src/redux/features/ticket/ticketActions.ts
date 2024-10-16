'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Ticket } from '@/types';
import { ticketSlice, RootState } from '@/redux';
import { TicketServerActions } from '@/server';

export const createTicket = createAsyncThunk(
  'ticket/createTicket',
  async (
    payload: {
      context: string;
      workspaceId?: string;
      propertyId?: string;
    },
    { dispatch }
  ) => {
    const { startLoading, stopLoading, setError } = ticketSlice;
    dispatch(startLoading());
    const res = await TicketServerActions.CreateTicket(payload);
    if ('data' in res) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'creating new ticket failed' }));
    }
  }
);

export const replyTicket = createAsyncThunk(
  'ticket/replyTicket',
  async (
    payload: {
      ticketId: string;
      context: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setTicketDetail, setError } = ticketSlice;
    dispatch(startLoading());
    const res = await TicketServerActions.ReplyTicket(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.ticket.tickets || ([] as Ticket[]);
      const updatedticket: Ticket = prev.filter(t => t._id === payload.ticketId)[0];
      dispatch(
        setTicketDetail({ ticketDetail: { ...updatedticket, conversation: res.data.reply } })
      );
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'replying to ticket failed' }));
    }
  }
);

export const getAllTicket = createAsyncThunk('ticket/getAllTicket', async (_, { dispatch }) => {
  const { startLoading, setTickets, setHistory, setError } = ticketSlice;
  dispatch(startLoading());
  const res = await TicketServerActions.GetAllTickets();
  if ('data' in res) {
    const activeTickets = res.data.tickets.filter(t => t.status === 'active');
    const inactiveTickets = res.data.tickets.filter(t => t.status === 'inactive');
    dispatch(setTickets({ tickets: activeTickets }));
    dispatch(setHistory({ history: inactiveTickets }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting all tickets failed' }));
  }
});

export const closeTicket = createAsyncThunk(
  'ticket/closeTicket',
  async (
    payload: {
      ticketId: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setTickets, setError } = ticketSlice;
    dispatch(startLoading());
    const res = await TicketServerActions.CloseTicket(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.ticket.tickets || ([] as Ticket[]);
      const updatedticket: Ticket[] = prev.map(t =>
        t._id === payload.ticketId
          ? {
              ...t,
              status: 'inactive',
            }
          : t
      );
      dispatch(setTickets({ tickets: updatedticket }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'closing ticket failed' }));
    }
  }
);

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
      const prev = state.ticket.ticketDetail || ({} as Ticket);
      dispatch(setTicketDetail({ ticketDetail: { ...prev, conversation: res.data.reply } }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'replying to ticket failed' }));
    }
  }
);

export const getAllTicket = createAsyncThunk('ticket/getAllTicket', async (_, { dispatch }) => {
  const { startLoading, setUserTickets, setWorkspaceTickets, setPropertyTickets, setError } =
    ticketSlice;
  dispatch(startLoading());
  const res = await TicketServerActions.GetAllTickets();
  if ('data' in res) {
    const activeTickets = res.data.tickets.filter(t => t.status === 'active');
    const inactiveTickets = res.data.tickets.filter(t => t.status === 'inactive');
    const workspaceActiveTickets = activeTickets.filter(t => t.workspace);
    const workspaceInactiveTickets = inactiveTickets.filter(t => t.workspace);
    const propertyActiveTickets = activeTickets.filter(t => t.property);
    const propertyInactiveTickets = inactiveTickets.filter(t => t.property);
    dispatch(setUserTickets({ userTickets: { tickets: activeTickets, history: inactiveTickets } }));
    dispatch(
      setWorkspaceTickets({
        workspaceTickets: {
          tickets: workspaceActiveTickets,
          history: workspaceInactiveTickets,
        },
      })
    );
    dispatch(
      setPropertyTickets({
        propertyTickets: {
          tickets: propertyActiveTickets,
          history: propertyInactiveTickets,
        },
      })
    );
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
    const { startLoading, setUserTickets, setWorkspaceTickets, setPropertyTickets, setError } =
      ticketSlice;
    dispatch(startLoading());
    const res = await TicketServerActions.CloseTicket(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prevUserTickets = state.ticket.userTickets?.tickets || ([] as Ticket[]);
      const prevWorkspaceTickets = state.ticket.workspaceTickets?.tickets || ([] as Ticket[]);
      const prevPropertyTickets = state.ticket.propertyTickets?.tickets || ([] as Ticket[]);
      const updatedUserTickets: Ticket[] = prevUserTickets.map(t =>
        t._id === payload.ticketId && t.status === 'active' ? { ...t, status: 'inactive' } : t
      );
      const updatedWorkspaceTickets: Ticket[] = prevWorkspaceTickets.map(t =>
        t._id === payload.ticketId && t.status === 'active' ? { ...t, status: 'inactive' } : t
      );
      const updatedPropertyTickets: Ticket[] = prevPropertyTickets.map(t =>
        t._id === payload.ticketId && t.status === 'active' ? { ...t, status: 'inactive' } : t
      );
      dispatch(
        setUserTickets({
          userTickets: {
            tickets: updatedUserTickets,
            history: state.ticket.userTickets?.history ?? [],
          },
        })
      );
      dispatch(
        setWorkspaceTickets({
          workspaceTickets: {
            tickets: updatedWorkspaceTickets,
            history: state.ticket.workspaceTickets?.history ?? [],
          },
        })
      );
      dispatch(
        setPropertyTickets({
          propertyTickets: {
            tickets: updatedPropertyTickets,
            history: state.ticket.propertyTickets?.history ?? [],
          },
        })
      );
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'closing ticket failed' }));
    }
  }
);

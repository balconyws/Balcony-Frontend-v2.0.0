'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import { cardSlice, RootState } from '@/redux';
import { encrypt } from '@/hash/client';
import { CardServerActions } from '@/server';
import { CardDetail } from '@/types';

export const addCard = createAsyncThunk(
  'card/addCard',
  async (payload: { token: string }, { dispatch, getState }) => {
    const { startLoading, setCards, setError } = cardSlice;
    dispatch(startLoading());
    const crypto = encrypt(payload);
    Cookies.set('tmp', crypto, { expires: 1 / 1440 }); // 1 minute
    const res = await CardServerActions.AddCard();
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.card.cards || [];
      const newCards = [
        ...prev,
        {
          ...res.data.card,
        },
      ];
      dispatch(setCards({ cards: newCards }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'adding new card failed' }));
    }
  }
);

export const getAllCards = createAsyncThunk('card/getAllCards', async (_, { dispatch }) => {
  const { startLoading, setCards, setError } = cardSlice;
  dispatch(startLoading());
  const res = await CardServerActions.GetAllCards();
  if ('data' in res) {
    dispatch(setCards({ cards: res.data.cards }));
  } else if ('error' in res) {
    dispatch(setError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(setError({ key: '', message: 'getting all cards failed' }));
  }
});

export const updateCard = createAsyncThunk(
  'card/updateCard',
  async (
    payload: {
      id: string;
      name: string;
      month: string;
      year: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setCards, setError } = cardSlice;
    dispatch(startLoading());
    const res = await CardServerActions.UpdateCard(payload);
    if ('data' in res) {
      const state = getState() as RootState;
      const prev = state.card.cards || ([] as CardDetail[]);
      const updatedCards = prev.map(card =>
        card._id === payload.id
          ? {
              ...res.data.card,
            }
          : card
      );
      dispatch(setCards({ cards: updatedCards }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating card failed' }));
    }
  }
);

export const changeDefaultCard = createAsyncThunk(
  'card/changeDefaultCard',
  async (
    payload: {
      cardId: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setCards, setError } = cardSlice;
    dispatch(startLoading());
    const res = await CardServerActions.ChangeDefaultCard(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prev = state.card.cards || ([] as CardDetail[]);
      const updatedCards = prev.map(card =>
        card._id === payload.cardId
          ? {
              ...card,
              default: true,
            }
          : {
              ...card,
              default: false,
            }
      );
      dispatch(setCards({ cards: updatedCards }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating card failed' }));
    }
  }
);

export const deleteCard = createAsyncThunk(
  'card/deleteCard',
  async (
    payload: {
      id: string;
    },
    { dispatch, getState }
  ) => {
    const { startLoading, setCards, setError } = cardSlice;
    dispatch(startLoading());
    const res = await CardServerActions.DeleteCard(payload);
    if ('data' in res && res.data.success) {
      const state = getState() as RootState;
      const prev = state.card.cards || ([] as CardDetail[]);
      const updatedCards = prev.filter(card => card._id !== payload.id);
      dispatch(setCards({ cards: updatedCards }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'deleting card failed' }));
    }
  }
);

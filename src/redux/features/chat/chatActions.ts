'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Message } from '@/types';
import { sendMessage } from '@/socket';
import { ChatServerActions } from '@/server';
import { chatSlice, RootState } from '@/redux';

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (
    payload: {
      userId: string;
    },
    { dispatch }
  ) => {
    const { startLoading, setConversations, setError } = chatSlice;
    dispatch(startLoading());
    const res = await ChatServerActions.StartConversation(payload);
    if ('data' in res) {
      dispatch(setConversations({ conversations: [res.data.conversation] }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'creating new conversation failed' }));
    }
  }
);

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, { dispatch }) => {
    const { startLoading, setConversations, setError } = chatSlice;
    dispatch(startLoading());
    const res = await ChatServerActions.GetConversations();
    if ('data' in res) {
      dispatch(setConversations({ conversations: res.data.conversations }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all conversations failed' }));
    }
  }
);

export const updateConversation = createAsyncThunk(
  'chat/updateConversation',
  async (payload: { conversationId: string; isSeen: boolean }, { dispatch }) => {
    const { stopLoading, setError } = chatSlice;
    const res = await ChatServerActions.LastMessageSeen(payload);
    if ('data' in res) {
      dispatch(stopLoading());
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'updating conversation failed' }));
    }
  }
);

export const createMessage = createAsyncThunk(
  'chat/createMessage',
  async (
    payload: {
      conversationId: string;
      senderId: string;
      receiverId: string;
      text?: string;
      media?: any;
    },
    { dispatch, getState }
  ) => {
    const { stopLoading, setMessages, setError } = chatSlice;
    const formData = new FormData();
    formData.append('conversationId', payload.conversationId);
    if (payload.text && payload.text.trim() !== '') {
      formData.append('text', payload.text);
    } else if (payload.media && payload.media !== '') {
      formData.append('media', payload.media);
    }
    const res = await ChatServerActions.CreateMessage(formData);
    if ('data' in res) {
      if (res.data.media) {
        const state = getState() as RootState;
        const prev = state.chat.messages || ([] as Message[]);
        const newMessages = [
          ...prev,
          {
            _id: payload.senderId + payload.receiverId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            media: res.data.media,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        dispatch(setMessages({ messages: newMessages }));
        sendMessage({
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          media: res.data.media,
          seen: false,
        });
      }
      const updt = await ChatServerActions.UpdateConversation({
        conversationId: formData.get('conversationId') as string,
        messageId: res.data.messageId,
      });
      if ('data' in updt) {
        dispatch(stopLoading());
      } else {
        dispatch(setError({ key: updt.error.key, message: updt.error.message }));
      }
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'creating new message failed' }));
    }
  }
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (
    payload: {
      conversationId: string;
    },
    { dispatch }
  ) => {
    const { startLoading, setMessages, setError } = chatSlice;
    dispatch(startLoading());
    const res = await ChatServerActions.GetMessages(payload);
    if ('data' in res) {
      dispatch(setMessages({ messages: res.data.messages }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'getting all messages failed' }));
    }
  }
);

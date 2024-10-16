'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux';
import { ChatState, Conversation, Message } from '@/types';

const initialState: ChatState = {
  loading: false,
  isFailed: false,
};

const chatSlice = createSlice({
  name: 'chat',
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
    setConversations: (state, action: PayloadAction<{ conversations: Conversation[] }>) => {
      state.loading = false;
      state.conversations = action.payload.conversations;
      state.isFailed = false;
    },
    setMessages: (state, action: PayloadAction<{ messages: Message[] }>) => {
      state.loading = false;
      state.messages = action.payload.messages;
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

export const { startLoading, setConversations, setMessages, stopLoading, setError, clearError } =
  chatSlice.actions;
export const selectChat = (state: RootState) => state.chat;
export default chatSlice.reducer;

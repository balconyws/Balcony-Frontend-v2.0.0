'use client';

import { io } from 'socket.io-client';

import { SocketMessage } from '@/types';

const socket = io();

export const addUser = (userId: string) => socket.emit('addUser', userId);

export const sendMessage = (message: SocketMessage) => {
  socket.emit('sendMessage', message);
};

export default socket;

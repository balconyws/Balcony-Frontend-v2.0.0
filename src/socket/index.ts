'use client';

import { io } from 'socket.io-client';

import { SocketMessage } from '@/types';

const socket = io(process.env.BACKEND_URL ?? '', {
  withCredentials: true, // Include credentials for cross-origin requests
});

export const addUser = (userId: string) => socket.emit('addUser', userId);

export const sendMessage = (message: SocketMessage) => {
  socket.emit('sendMessage', message);
};

export default socket;

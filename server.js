/* eslint-disable no-console */
import { join } from 'path';
import { createServer } from 'node:http';

import next from 'next';
import express from 'express';
import compression from 'express-compression';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

app
  .prepare()
  .then(() => {
    const expressApp = express();
    const handler = app.getRequestHandler();

    expressApp.use(compression({ filter: shouldCompress }));
    expressApp.use('/assets', express.static(join(process.cwd(), 'public/assets')));

    expressApp.all('*', (req, res) => handler(req, res));

    const server = createServer(handler);
    const io = new Server(server);

    let users = [];

    const addUser = (userId, socketId) => {
      if (!users.some(user => user.socketId === socketId)) {
        users.push({ userId, socketId });
      }
    };

    const removeUser = socketId => (users = users.filter(user => user.socketId !== socketId));

    const getUser = userId => users.find(user => user.userId === userId);

    // Define a message object with a seen property
    const createMessage = ({ senderId, receiverId, text, media }) => ({
      senderId,
      receiverId,
      text,
      media,
      seen: false,
    });

    io.on('connection', socket => {
      // take userId and socketId from user
      socket.on('addUser', userId => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
      });

      // send and get message
      const messages = {}; // Object to track messages sent to each user

      socket.on('sendMessage', ({ senderId, receiverId, text, media, seen }) => {
        const message = createMessage({ senderId, receiverId, text, media, seen });

        // Store the messages in the `messages` object
        if (!messages[receiverId]) {
          messages[receiverId] = [message];
        } else {
          messages[receiverId].push(message);
        }

        const sender = getUser(senderId);
        const receiver = getUser(receiverId);
        // send the message to the sender and the receiver
        io.to(sender?.socketId).emit('getMessage', message);
        io.to(receiver?.socketId).emit('getMessage', message);
      });

      //when disconnect
      socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('getUsers', users);
      });
    });

    server
      .once('error', err => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`🚀 ~ Server is listening On ~> http://${hostname}:${port}`);
      });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

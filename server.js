/* eslint-disable no-console */
import { join } from 'path';
import { createServer } from 'node:http';

import next from 'next';
import express from 'express';
import compression from 'express-compression';
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

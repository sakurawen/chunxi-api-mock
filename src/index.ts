import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { commonRouter } from './routes/common/route.js';
import { emrRouter } from './routes/emr/route.js';
import { userRouter } from './routes/user/route.js';

const app = new Hono().route('/common', commonRouter).route('/user', userRouter).route('/emr', emrRouter);

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${info.port}`);
});

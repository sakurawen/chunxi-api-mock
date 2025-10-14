import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { commonRouter } from './routes/common/route.js';
import { emrRouter } from './routes/emr/route.js';
import { hospitalRouter } from './routes/hospital/route.js';
import { patientRouter } from './routes/patient/route.js';
import { userRouter } from './routes/user/route.js';

const app = new Hono().use(cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
})).route('/common', commonRouter).route('/patient', patientRouter).route('/hospital', hospitalRouter).route('/user', userRouter).route('/emr', emrRouter);

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${info.port}`);
});

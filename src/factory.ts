import type { Env } from '~/env.js';
import {} from 'hono';
import { createFactory } from 'hono/factory';

export const factory = createFactory<Env>();

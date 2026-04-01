import { Elysia } from 'elysia';
import db from './db';
import * as schema from './db/schema';

const app = new Elysia()
  .get('/', () => 'Welcome to Vibe Code Backend!')
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

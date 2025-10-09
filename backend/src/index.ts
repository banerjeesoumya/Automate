import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { Env } from './types/env'
import { authRouter } from './routes/auth'
import { getDB } from './db/client'

interface CustomContext {
  db: ReturnType<typeof drizzle>
}

const app = new Hono<{
  Bindings: Env,
  Variables: CustomContext
}>()

app.use('*', async (c, next) => {
  const database = getDB(c.env);
  if (!database) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  console.log('Database connected');
  c.set('db', database);
  await next();
})

const api = app.basePath('/api');

app.get('/', async (c) => {
  const db = c.get('db') as ReturnType<typeof drizzle>;
  if (!db) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  return c.json({ message: 'Hello, Hono with D1 and Drizzle ORM!' })
})

api.route('/auth', authRouter);
export default app

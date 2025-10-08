import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { Env } from './types/env'
import { authRouter } from './routes/auth'


const app = new Hono<{
  Bindings: Env
}>()

app.get('/', async (c) => {
  const db = drizzle(c.env.hr_d1);
  if (!db) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  return c.json({ message: 'Hello, Hono with D1 and Drizzle ORM!' })
})

app.route('/auth', authRouter);

export default app

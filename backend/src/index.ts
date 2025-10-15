import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { Env } from './types/env'
import { getDB } from './db/client'
import { createAuth } from './utils/auth'
import { conversationRouter } from './routes/conversation'

interface CustomContext {
  db: ReturnType<typeof drizzle>,
  userId?: string,
}

const app = new Hono<{
  Bindings: Env,
  Variables: CustomContext
}>()

app.use("*", async (c, next) => {
  c.set("db", getDB(c.env));
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  console.log("BetterAuth routes:");
  return auth.handler(c.req.raw);
});

app.get('/health', async (c) => {
  const db = c.get('db') as ReturnType<typeof drizzle>;
  if (!db) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  return c.json({ message: 'Hello, Hono with D1 and Drizzle ORM!' })
})

app.route('/api', conversationRouter);


export default app
export { ChatRoom } from './durable/ChatRoom'

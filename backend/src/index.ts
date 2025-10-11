import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { Env } from './types/env'
import { getDB } from './db/client'
import { createAuth } from './utils/auth'
import { authMiddleware } from './utils/authMiddleware'
import { user } from './db/schema'
import { eq } from 'drizzle-orm'

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

app.get('/', async (c) => {
  const db = c.get('db') as ReturnType<typeof drizzle>;
  if (!db) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  return c.json({ message: 'Hello, Hono with D1 and Drizzle ORM!' })
})

app.get('/api/profile', authMiddleware(), async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ message: 'User not logged in' }, 401);
  }
  console.log('Authenticated user ID:', userId);
  const db = c.get('db') as ReturnType<typeof drizzle>;
  const userDetails = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (userDetails.length === 0) {
    return c.json({ message: 'User not found' }, 404);
  }
  return c.json({ user: userDetails[0] });
})

app.get('/api/test', async (c) => {
  const id = c.env.CHAT_ROOM.idFromName("my-chat-room");
  const stub = c.env.CHAT_ROOM.get(id);
  // @ts-ignore
  const count = await stub.increment();
  return c.json({ count })
})

export default app
export { ChatRoom } from './durable/ChatRoom'

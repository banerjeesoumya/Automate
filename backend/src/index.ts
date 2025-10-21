import { Hono } from 'hono'
import { Env } from './types/env'
import { createAuth } from './utils/auth'
import { conversationRouter } from './routes/conversation'
import { workflowRouter } from './routes/workflow'
import { PrismaClient } from './generated/prisma/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

interface CustomContext {
  userId?: string,
}

const app = new Hono<{
  Bindings: Env,
  Variables: CustomContext
}>()


app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  console.log(c.env.CONNECTION_POOL_URL);
  console.log("BetterAuth routes:");
  return auth.handler(c.req.raw);
});

app.get('/api/health', async (c) => {
  const db = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL
  }).$extends(withAccelerate());
  if (!db) {
    return c.json({ message: 'Database connection error' }, 500);
  }
  return c.json({ message: 'Hello, Hono with Postgres and Prisma ORM!' })
})

app.route('/api', conversationRouter);
app.route('/api', workflowRouter);


export default app
export { ChatRoom } from './durable/ChatRoom'

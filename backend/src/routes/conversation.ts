import { Hono } from "hono";
import { authMiddleware } from "../utils/authMiddleware";
import { Env } from "../types/env";
import { getDB } from "../db/client";
import { conversation } from "../db/schema";
import { id } from "zod/v4/locales";

export const conversationRouter = new Hono<{ 
  Bindings: Env,
  Variables: { userId?: string} 
}>();

conversationRouter.post("/conversations", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }
  const db = getDB(c.env);
  try {
      const [createChat] = await db.insert(conversation).values({
      ownerId: userId,
    }).returning({ id: conversation.id });
    return c.json({
      ok: true,
      message: "Conversation created",
      conversationId: createChat.id
    }, 201);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return c.json({
      ok: false,
      message: "Error creating conversation"
    }, 500);
  }
})
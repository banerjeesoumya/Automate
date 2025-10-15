import { Hono } from "hono";
import { authMiddleware } from "../utils/authMiddleware";
import { Env } from "../types/env";
import { getDB } from "../db/client";
import { conversation } from "../db/schema";
import { and, desc, eq } from "drizzle-orm";

export const conversationRouter = new Hono<{ 
  Bindings: Env,
  Variables: { userId?: string} 
}>();

conversationRouter.get("/conversations", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }
  const db = getDB(c.env);
  try {
    const conversations = await db.select().from(conversation).where(eq(conversation.ownerId, userId)).orderBy(desc(conversation.updatedAt));
    return c.json({
      ok: true,
      conversations: conversations.map(conv => ({
        id: conv.id,
        conversationId: conv.conversation_id,
        title: conv.title
      }))
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return c.json({
      ok: false,
      message: "Error fetching conversations"
    }, 500);
  }
})

conversationRouter.get("/conversations/:id", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }
  const conversationId = c.req.param("id");
  if (!conversationId) {
    return c.json({ error: "Conversation ID is required" }, 400);
  }
  const db = getDB(c.env);
  try {
    const conv = await db.query.conversation.findFirst({
      where: and(
        eq(conversation.conversation_id, conversationId),
        eq(conversation.ownerId, userId)
      ),
    });

    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json({
      ok: true,
      conversation: {
        id: conv.id,
        conversationId: conv.conversation_id,
        title: conv.title ?? "Untitled Chat",
        lastMessage: conv.last_message ?? "",
        updatedAt: conv.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return c.json({
      ok: false,
      message: "Error fetching conversation"
    }, 500);
  }
})

conversationRouter.get("/conversations/:id/history", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }
  const conversationId = c.req.param("id");
  if (!conversationId) {
    return c.json({ error: "Conversation ID is required" }, 400);
  }
  const db = getDB(c.env);
  try {
    const conv = await db.query.conversation.findFirst({
      where: and(
        eq(conversation.conversation_id, conversationId),
        eq(conversation.ownerId, userId)
      ),
    });
    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    } else {
      const doID = c.env.CHAT_ROOM.idFromName(conversationId);
      const stub = c.env.CHAT_ROOM.get(doID);
      const resp = await stub.fetch(new URL("/history", "http://do").toString(), { method: "GET" });
      return new Response(resp.body, resp);
    }
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return c.json({
      ok: false,
      message: "Error fetching conversation history"
    }, 500);
  }
})

conversationRouter.post("/conversations/:id/actions", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }

  const conversationId = c.req.param("id");
  if (!conversationId) {
    return c.json({ error: "Conversation ID is required" }, 400);
  }

  const body = await c.req.json<{ action: string; value?: string }>();
  if (!body.action) {
    return c.json({ error: "Action is required" }, 400);
  }
  if (body.action === "rename" && !body.value) {
    return c.json({ error: "Missing value for rename action" }, 400);
  }
  
  const db = getDB(c.env);
  try {
    const conv = await db.query.conversation.findFirst({
      where: and(
        eq(conversation.conversation_id, conversationId),
        eq(conversation.ownerId, userId)
      ),
    });
    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    switch (body.action) {
      case "rename":
        await db.update(conversation).set({ title: body.value }).where(eq(conversation.id, conv.id));
        return c.json({ ok: true, message: "Conversation renamed" });
      case "delete":
        await db.delete(conversation).where(eq(conversation.id, conv.id));
        return c.json({ ok: true, message: "Conversation deleted" });
      default:
        return c.json({ error: "Unknown action" }, 400);
    }
  } catch (error) {
    console.error("Error handling conversation action:", error);
    return c.json({
      ok: false,
      message: "Error handling conversation action"
    }, 500);
  }
})

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

conversationRouter.post("/conversations/:id/messages", authMiddleware(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({
      message: "User not logged in"
    }, 401);
  }
  const conversationId = c.req.param("id");
  if (!conversationId) {
    return c.json({ error: "Conversation ID is required" }, 400);
  }
  console.log("Conversation ID:", conversationId);
  // The id(pk) and conversation_id (public id) are different. We are using the pk here obtained from the previous endpoint.
  const body = await c.req.json<{ message: string; id: string }>();
  if (!body?.id || !body?.message) {
    return c.json({ error: "Invalid request body" }, 400);
  }
  console.log("Request Body:", body);
  const doID = c.env.CHAT_ROOM.idFromName(conversationId);
  const stub = c.env.CHAT_ROOM.get(doID);
  console.log("Forwarding to DO with ID:", doID.toString());
  const resp = await stub.fetch(new URL("/message", "http://do").toString(), {
    method: "POST",
    body: JSON.stringify({
      id: body.id,
      text: body.message,
      conversationId: conversationId
    })
  });
  return new Response(resp.body, resp);
});
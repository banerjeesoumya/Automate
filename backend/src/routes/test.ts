import { Hono } from "hono";
import { createId } from "@paralleldrive/cuid2";
import { createAuth } from "../utils/auth";

const router = new Hono<{ Bindings: Env }>();

// TODO: Replace this with BetterAuth session resolution.
// Example idea (pseudo): const session = await auth.getSession(c.req.raw); const userId = session.user.id;
async function resolveUserId(c: any): Promise<string | null> {
  try {
    const auth = createAuth(c.env);
    // If better-auth exposes a way to get session from a Request, use it here.
    // For now, accept a header "x-user-id" for local dev/testing.
    const headerUser = c.req.header("x-user-id");
    if (headerUser) return headerUser;
  } catch {}
  const bearer = c.req.header("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }
  return null;
}
  
router.post("/conversations", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { title } = await c.req.json<{ title?: string }>().catch(() => ({} as any));
  const conversationId = createId();
  const now = Date.now();

  await c.env.hr_d1
    .prepare(
      "INSERT INTO conversations (id, owner_id, title, last_message, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(conversationId, userId, title || "New chat", "", now, now)
    .run();

  return c.json({ conversationId }, 201);
});

router.get("/conversations", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { results } = await c.env.hr_d1
    .prepare(
      "SELECT id as conversationId, title, last_message as lastMessage, updated_at as updatedAt FROM conversations WHERE owner_id = ? ORDER BY updated_at DESC"
    )
    .bind(userId)
    .all();

  return c.json(results ?? []);
});

router.get("/conversations/:id", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const row = await c.env.hr_d1
    .prepare(
      "SELECT id as conversationId, title, last_message as lastMessage, updated_at as updatedAt, created_at as createdAt FROM conversations WHERE id = ? AND owner_id = ?"
    )
    .bind(id, userId)
    .first();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

router.get("/conversations/:id/history", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  // Ownership check
  const exists = await c.env.hr_d1
    .prepare("SELECT 1 FROM conversations WHERE id = ? AND owner_id = ?")
    .bind(id, userId)
    .first();

  if (!exists) return c.json({ error: "Not found" }, 404);

  const doId = c.env.CHAT_ROOM.idFromName(id);
  const stub = c.env.CHAT_ROOM.get(doId);
  const resp = await stub.fetch(new URL("/history", "http://do").toString(), { method: "GET" });
  return new Response(resp.body, resp);
});

router.post("/conversations/:id/message", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = await c.req.json<{ message: string; clientRequestId?: string; stream?: boolean }>();

  if (!body?.message) return c.json({ error: "Missing message" }, 400);

  const exists = await c.env.hr_d1
    .prepare("SELECT 1 FROM conversations WHERE id = ? AND owner_id = ?")
    .bind(id, userId)
    .first();

  if (!exists) return c.json({ error: "Not found" }, 404);

  const doId = c.env.CHAT_ROOM.idFromName(id);
  const stub = c.env.CHAT_ROOM.get(doId);

  const resp = await stub.fetch(new URL("/message", "http://do").toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userId,
      conversationId: id,
      text: body.message,
      clientRequestId: body.clientRequestId,
    }),
  });

  return new Response(resp.body, resp);
});

router.post("/conversations/:id/actions", async c => {
  const userId = await resolveUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const { action, value } = await c.req.json<{ action: string; value?: string }>();

  const exists = await c.env.hr_d1
    .prepare("SELECT 1 FROM conversations WHERE id = ? AND owner_id = ?")
    .bind(id, userId)
    .first();

  if (!exists) return c.json({ error: "Not found" }, 404);

  if (action === "rename") {
    if (!value) return c.json({ error: "Missing value" }, 400);
    const now = Date.now();
    await c.env.hr_d1
      .prepare("UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND owner_id = ?")
      .bind(value, now, id, userId)
      .run();

    // Also update DO meta (best-effort)
    const doId = c.env.CHAT_ROOM.idFromName(id);
    const stub = c.env.CHAT_ROOM.get(doId);
    await stub.fetch(new URL("/meta", "http://do").toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: value }),
    });

    return c.json({ ok: true });
  }

  return c.json({ error: "Unsupported action" }, 400);
});

export default router;

type Env = import("../types/env").Env;
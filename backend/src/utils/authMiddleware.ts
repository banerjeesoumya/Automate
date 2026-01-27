import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getDB } from "@repo/db/client";

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") return next();

    try {
      const db = getDB(c.env);

      // Better Auth session token cookie names
      const token =
        getCookie(c, "better-auth.session_token") ||
        getCookie(c, "__Secure-better-auth.session_token") ||
        getCookie(c, "__Host-better-auth.session_token");

      if (!token) {
        return c.json({ message: "Unauthorized (no session token)" }, 401);
      }

      const decodedToken = decodeURIComponent(token);

      // Better Auth tokens often come in the format "sessionId.sessionToken"
      // or "sessionId-sessionToken". We try to parse it.
      const parts = decodedToken.split(/[.-]/);
      const possibleIds = [decodedToken, ...parts];

      // Verify session directly in database
      let session = await db.session.findFirst({
        where: {
          OR: [
            { id: { in: possibleIds } },
            { token: { in: possibleIds } }
          ]
        },
        include: { user: true },
      });

      if (!session) {
        return c.json({ message: "Unauthorized (invalid session)" }, 401);
      }

      if (!session.user) {
        return c.json({ message: "Unauthorized (invalid session)" }, 401);
      }

      // Check if session has expired
      if (new Date(session.expiresAt) < new Date()) {
        await db.session.delete({ where: { id: session.id } }).catch(() => { });
        return c.json({ message: "Session expired" }, 401);
      }

      // Set userId in context for downstream routes
      c.set("userId", String(session.user.id));

      return next();
    } catch (error) {
      console.error("authMiddleware error:", error);
      return c.json({ message: "Unauthorized (internal error)" }, 500);
    }
  };
};

import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getDB } from "@repo/db/client";

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") return next();

    try {
      if (!c.env.CONNECTION_POOL_URL) {
        console.error("❌ [Auth] CONNECTION_POOL_URL is missing in environment");
        return c.json({ message: "Unauthorized (internal error)", error: "Database configuration missing" }, 500);
      }

      const db = getDB(c.env);

      // 1. Try to get token from Authorization header (Bearer <token>)
      const authHeader = c.req.header("Authorization");
      let token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

      // 2. Fall back to Better Auth session token cookies
      if (!token) {
        token =
          getCookie(c, "better-auth.session_token") ||
          getCookie(c, "better_auth.session_token") ||
          getCookie(c, "__Secure-better-auth.session_token") ||
          getCookie(c, "__Secure-better_auth.session_token") ||
          getCookie(c, "__Host-better-auth.session_token") ||
          getCookie(c, "__Host-better_auth.session_token") ||
          null;
        if (token) console.log("🔍 [Auth] Token found in Cookies");
      } else {
        console.log("🔍 [Auth] Token found in Authorization Header");
      }

      if (!token) {
        return c.json({ message: "Unauthorized (no session token)" }, 401);
      }

      const decodedToken = decodeURIComponent(token);

      // Better Auth tokens often come in the format "sessionId.sessionToken"
      // or "sessionId-sessionToken" or "sessionId_sessionToken".
      const parts = decodedToken.split(/[._-]/);
      const possibleIds = [decodedToken, ...parts];

      console.log("🔍 [Auth] Verifying session. Token parts:", possibleIds);

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
        console.log("❌ [Auth] No session found in DB for possible IDs");
        return c.json({ message: "Unauthorized (invalid session)" }, 401);
      }

      console.log("✅ [Auth] Session verified for user:", session.user?.email);

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
    } catch (error: any) {
      console.error("authMiddleware error:", error);
      return c.json({
        message: "Unauthorized (internal error)",
        error: error?.message || String(error),
        stack: error?.stack
      }, 500);
    }
  };
};

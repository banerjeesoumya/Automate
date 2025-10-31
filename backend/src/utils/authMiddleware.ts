import { Context, Next } from "hono";
import { getAuth } from "./auth";
import { getDB } from "../db/client";

/**
 * ✅ Hybrid auth middleware with account-level provider detection
 * - Uses accounts table to detect if user is "credentials" or OAuth
 * - Validates accordingly
 */
export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") return next();

    try {
      const db = getDB(c.env);
      const cookie = c.req.header("Cookie") || "";

      // 1️⃣ Extract the session token (manual or BetterAuth)
      const token =
        cookie.match(/better-auth\.session_token=([^;]+)/)?.[1] ??
        cookie.match(/__Secure-better-auth\.session_token=([^;]+)/)?.[1];

      if (!token) {
        return c.json({ message: "Unauthorized (no session token)" }, 401);
      }

      // 2️⃣ Try finding a session entry in DB
      const session = await db.session.findUnique({
        where: { token },
        include: { user: { include: { accounts: true } } },
      });

      // 3️⃣ If session exists, check provider from accounts table
      if (session && session.user) {
        const account = session.user.accounts?.[0]; // first linked provider
        const provider = account?.providerId ?? "unknown";

        // 🧩 If it's a credentials-based account → manual validation is enough
        if (provider === "credentials") {
          // Optional: check expiry
          if (new Date(session.expiresAt) < new Date()) {
            await db.session.delete({ where: { id: session.id } });
            return c.json({ message: "Session expired" }, 401);
          }

          c.set("userId", String(session.user.id));
          c.set("provider", provider);
          return next();
        }

        // 🔄 If it's not credentials → let BetterAuth validate instead
      }

      // 4️⃣ Fallback → try BetterAuth session validation
      const auth = getAuth(c.env);
      const betterSession = await auth.api.getSession(c.req.raw);

      if (betterSession && betterSession.user) {
        c.set("userId", String(betterSession.user.id));
        c.set("provider", "oauth");
        return next();
      }

      // ❌ No valid session found
      return c.json({ message: "Unauthorized (invalid session)" }, 401);
    } catch (error) {
      console.error("authHybridMiddleware error:", error);
      return c.json({ message: "Unauthorized (internal error)" }, 500);
    }
  };
};

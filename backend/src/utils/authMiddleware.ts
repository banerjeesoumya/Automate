import { Context, Next } from "hono";
import { getAuth } from "./auth";
import { getDB } from "@repo/db/client";

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") return next();

    try {
      const db = getDB(c.env);
      const cookie = c.req.header("Cookie") || "";

      const token =
        cookie.match(/better-auth\.session_token=([^;]+)/)?.[1] ??
        cookie.match(/__Secure-better-auth\.session_token=([^;]+)/)?.[1];

      if (!token) {
        return c.json({ message: "Unauthorized (no session token)" }, 401);
      }

      const session = await db.session.findUnique({
        where: { token },
        include: { user: { include: { accounts: true } } },
      });
      if (session && session.user) {
        const account = session.user.accounts?.[0];
        const provider = account?.providerId ?? "unknown";

        if (provider === "credentials") {
          if (new Date(session.expiresAt) < new Date()) {
            await db.session.delete({ where: { id: session.id } });
            return c.json({ message: "Session expired" }, 401);
          }

          c.set("userId", String(session.user.id));
          c.set("provider", provider);
          return next();
        }
      }
      const auth = getAuth(c.env);
      const betterSession = await auth.api.getSession(c.req.raw);

      if (betterSession && betterSession.user) {
        c.set("userId", String(betterSession.user.id));
        c.set("provider", "oauth");
        return next();
      }
      return c.json({ message: "Unauthorized (invalid session)" }, 401);
    } catch (error) {
      console.error("authHybridMiddleware error:", error);
      return c.json({ message: "Unauthorized (internal error)" }, 500);
    }
  };
};

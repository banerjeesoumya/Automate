import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Env } from "../types/env";
import { getDB } from "../db/client"; // your helper
import { createAuth } from "../utils/auth"; // your BetterAuth setup
import bcrypt from "bcryptjs";

export const credsRouter = new Hono<{
  Bindings: Env;
  Variables: { userId?: string };
}>();

/* ========================================================
   🪪 SIGNUP — Manual email/password registration
   ======================================================== */
credsRouter.post("/signup", async (c) => {
  const db = getDB(c.env);
  const auth = createAuth(c.env);
  const { email, password, name } = await c.req.json();

  if (!email || !password) {
    c.status(400);
    return c.json({ message: "Email and password are required." });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    c.status(400);
    return c.json({ message: "Email already in use." });
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 8);

  // ✅ Create user and account (mirroring BetterAuth schema)
  const newUser = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name: name ?? email,
      emailVerified: false,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: email,
          providerId: "credentials",
          password: hashedPassword,
        },
      },
    },
    include: { accounts: true },
  });

  // ✅ Create session entry (same as BetterAuth)
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId: newUser.id,
      expiresAt,
      ipAddress: c.req.header("CF-Connecting-IP") ?? undefined,
      userAgent: c.req.header("user-agent") ?? undefined,
    },
  });

  // ✅ Set cookie manually (BetterAuth-compatible)
  c.header(
    "Set-Cookie",
    `better-auth.session=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${
      7 * 24 * 60 * 60
    }`
  );

  return c.json({
    redirect: false,
    token,
    user: newUser,
  });
});

/* ========================================================
   🔐 SIGNIN — Manual email/password login
   ======================================================== */
credsRouter.post("/signin", async (c) => {
  const db = getDB(c.env);
  const { email, password } = await c.req.json();

  if (!email || !password) {
    c.status(400);
    return c.json({ message: "Email and password are required." });
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    c.status(400);
    return c.json({ message: "User not found." });
  }

  const account = user.accounts.find((a) => a.providerId === "credentials");
  if (!account || !account.password) {
    c.status(400);
    return c.json({ message: "Invalid credentials." });
  }

  const match = await bcrypt.compare(password, account.password);
  if (!match) {
    c.status(401);
    return c.json({ message: "Incorrect password." });
  }

  // ✅ Create new session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      id: crypto.randomUUID(),
      token,
      userId: user.id,
      expiresAt,
      ipAddress: c.req.header("CF-Connecting-IP") ?? undefined,
      userAgent: c.req.header("user-agent") ?? undefined,
    },
  });

  // ✅ Set BetterAuth-compatible cookie
  c.header(
    "Set-Cookie",
    `better-auth.session=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${
      7 * 24 * 60 * 60
    }`
  );

  return c.json({
    redirect: false,
    token,
    user,
  });
});

/* ========================================================
   🚪 SIGNOUT — Logout (delete session + clear cookie)
   ======================================================== */
credsRouter.post("/signout", async (c) => {
  const db = getDB(c.env);
  const cookie = c.req.header("Cookie");
  const token = cookie?.match(/better-auth\.session=([^;]+)/)?.[1];

  if (token) {
    await db.session.deleteMany({ where: { token } });
  }

  c.header(
    "Set-Cookie",
    "better-auth.session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0"
  );

  return c.json({ message: "Logged out successfully." });
});

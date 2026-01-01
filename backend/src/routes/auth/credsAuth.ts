import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { Env } from "../../types/env";
import { getDB } from "../../db/client";

export const credsRouter = new Hono<{
  Bindings: Env;
  Variables: { userId?: string };
}>();

credsRouter.post("/signup", async (c) => {
  const db = getDB(c.env);
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

  const hashedPassword = await bcrypt.hash(password, 8);

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

  const isProduction = c.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

  c.header(
    "Set-Cookie",
    `${cookieName}=${token}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=None; ${isProduction ? "Partitioned; " : ""}Max-Age=${
      7 * 24 * 60 * 60
    }`
  );

  return c.json({
    redirect: false,
    token,
    user: newUser,
  });
});

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

  const isProduction = c.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

  c.header(
    "Set-Cookie",
    `${cookieName}=${token}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=None; ${isProduction ? "Partitioned; " : ""}Max-Age=${
      7 * 24 * 60 * 60
    }`
  );

  return c.json({
    redirect: false,
    token,
    user,
  });
});

credsRouter.post("/signout", async (c) => {
  const db = getDB(c.env);
  const cookie = c.req.header("Cookie");
  const token = cookie?.match(/better-auth\.session_token=([^;]+)/)?.[1];

  if (token) {
    await db.session.deleteMany({ where: { token } });
  }

  const isProduction = c.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

  c.header(
  "Set-Cookie",
  `${cookieName}=; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=None; Max-Age=0`
);


  return c.json({ message: "Logged out successfully." });
});

credsRouter.get("/get-session", async (c) => {
  const db = getDB(c.env);
  const cookie = c.req.header("Cookie") || "";

  const token =
    cookie.match(/better-auth\.session_token=([^;]+)/)?.[1] ??
    cookie.match(/__Secure-better-auth\.session_token=([^;]+)/)?.[1];

  if (!token) {
    return c.json({ session: null, user: null, message: "No session cookie" }, 401);
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { accounts: true } } },
  });

  if (!session || !session.user) {
    return c.json({ session: null, user: null, message: "Invalid or expired session" }, 401);
  }

  if (new Date(session.expiresAt) < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return c.json({ session: null, user: null, message: "Session expired" }, 401);
  }

  const provider = session.user.accounts?.[0]?.providerId ?? "credentials";

  return c.json({
    session: {
      id: session.id,
      token: session.token,
      userId: session.userId,
      ipAddress: session.ipAddress ?? "",
      userAgent: session.userAgent ?? "",
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
    },
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      provider,
    },
  });
});

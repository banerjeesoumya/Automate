import { Hono } from "hono";
import { Env } from "./types/env";
import { createAuth } from "./utils/auth";
import { workflowRouter } from "./routes/workflow";
import { getDB } from "./db/client";
import { cors } from "hono/cors";
import { credsRouter } from "./routes/credsAuth";

interface CustomContext {
  userId?: string;
}

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

// ✅ Global CORS
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://automate-xi-jet.vercel.app",
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// ✅ Instantiate BetterAuth once per Worker isolate
let authInstance: ReturnType<typeof createAuth> | null = null;
function getAuth(env: Env) {
  if (!authInstance) {
    authInstance = createAuth(env);
  }
  return authInstance;
}

// ✅ Auth routes
app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  const startCpu = performance.now();
  const auth = getAuth(c.env);
  const result = await auth.handler(c.req.raw);
  const endCpu = performance.now();
  console.log(`(log) Auth handler took ${(endCpu - startCpu).toFixed(2)}ms CPU`);
  return result;
});

// ✅ Health check
app.get("/api/health", async (c) => {
  const db = getDB(c.env);
  const users = await db.user.findMany().catch(() => null);
  if (!users) {
    return c.json({ message: "Database connection error" }, 500);
  }
  return c.json({ message: "Healthy", usersCount: users.length });
});

// ✅ Example route to test session
app.get("/api/hello", async (c) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession(c.req.raw);
  return c.json({ session });
});

// ✅ Other routes
app.route("/api/creds", credsRouter);
app.route("/api", workflowRouter);

export default app;

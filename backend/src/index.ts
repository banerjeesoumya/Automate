import { Hono } from "hono";
import { Env } from "./types/env";
import { workflowRouter } from "./routes/workflows/workflow";
import { getDB } from "@repo/db/client";
import { cors } from "hono/cors";
import { credsRouter } from "./routes/auth/credsAuth";
import { authMiddleware } from "./utils/authMiddleware";
import { credentialRouter } from "./routes/credentials/credentials";
import { executionRouter } from "./routes/executions/executions";
import { MyWorkflow } from "./workflows/execute-workflow";
import { ExecutionState } from "./durable/execution-state";
import { webhookRouter } from "./routes/webhooks";

export {
  MyWorkflow, ExecutionState
}

interface CustomContext {
  userId?: string;
}

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://automate-xi-jet.vercel.app",
      "https://automate-git-featureauth-soumya-banerjees-projects.vercel.app",
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/api/health", async (c) => {
  const db = getDB(c.env);
  const users = await db.user.findMany().catch(() => null);
  if (!users) {
    return c.json({ message: "Database connection error" }, 500);
  }
  return c.json({ message: "Healthy", usersCount: users.length });
});

app.get("/api/hello", authMiddleware(), async (c) => {
  const userId = c.get("userId");

  console.log("Datasource URL:", c.env.CONNECTION_POOL_URL);
  return c.json({ userId });
});

app.route("/api/creds", credsRouter);
app.route("/api/workflows", workflowRouter);
app.route("/api/credentials", credentialRouter)
app.route("/api/executions", executionRouter);
app.route("/api/webhooks", webhookRouter);

export default app;

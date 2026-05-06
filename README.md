# Automate

Automate is an AI-first visual workflow automation platform for building multi-step automations on a drag-and-drop canvas. It combines trigger nodes, AI model nodes, utility nodes, and notification nodes in a durable execution pipeline with real-time monitoring.

## What It Does

- Build workflows visually with React Flow
- Trigger workflows manually, through HTTP webhooks, or from Google Form submissions
- Run AI steps with OpenAI, Anthropic, and Gemini
- Chain node outputs through template interpolation
- Send results to Slack, Discord, or external HTTP endpoints
- Track node-level execution status in real time
- Reuse workflows through a template library

## Architecture

- `frontend/`: Next.js 15 app router application
- `backend/`: Hono API running on Cloudflare Workers
- `packages/db/`: shared Prisma schema and database client

Core infrastructure:

- Frontend deployment: Vercel
- Backend runtime: Cloudflare Workers
- Durable execution: Cloudflare Workflows
- Real-time execution state: Cloudflare Durable Objects
- Database: PostgreSQL on Neon
- ORM: Prisma ORM + Prisma Accelerate
- Auth: Better Auth with email/password and OAuth support

## Key Features

### Visual Workflow Editor

Users create workflows on an infinite canvas, add nodes, connect edges, and save workflow graphs for later execution.

### Multi-AI Execution

AI nodes are first-class workflow steps. Prompt fields support template interpolation so downstream nodes can consume upstream outputs.

### Durable Workflow Runs

Each workflow execution is handled as a durable Cloudflare Workflow run. Nodes are executed in dependency order after topological sorting of the saved graph.

### Real-Time Monitoring

Execution state is tracked per run with Durable Objects and streamed back to the frontend for live status updates.

### Credential Management

Provider credentials are stored server-side and referenced by workflow nodes during execution.

### Templates

Reusable workflow templates help users bootstrap common automation patterns quickly.

## Monorepo Structure

```text
.
├─ frontend/      # Next.js app
├─ backend/       # Hono + Cloudflare Workers API
├─ packages/
│  └─ db/         # Prisma schema and shared DB client
├─ package.json
└─ pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Wrangler CLI
- Neon PostgreSQL database
- Prisma Accelerate connection string

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create environment files for the frontend, backend, and shared database package.

`frontend/.env`

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000/"
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8787/api"
NEXT_PUBLIC_BACKEND_WS_URL="ws://127.0.0.1:8787/api"
CONNECTION_POOL_URL=""
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000/"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

`backend/.env`

```env
DATABASE_URL=""
CONNECTION_POOL_URL=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_GENERATIVE_AI_API_KEY=""
```

`packages/db/.env`

```env
DATABASE_URL=""
CONNECTION_POOL_URL=""
```

### Generate Prisma Client

```bash
pnpm db:generate
```

### Run the App

From the workspace root:

```bash
pnpm dev
```

This starts:

- the Next.js frontend in `frontend/`
- the Cloudflare Workers backend in `backend/`

## Useful Commands

```bash
pnpm dev           # run frontend and backend
pnpm build         # build all workspace packages
pnpm lint          # run workspace lint scripts
pnpm db:generate   # generate Prisma client from packages/db
pnpm db:build      # build the shared DB package
```

## Execution Model

At a high level:

1. A user creates and saves a workflow graph from the frontend.
2. The backend validates the request and creates an execution record.
3. Cloudflare Workflows loads the graph and sorts nodes by dependency order.
4. Node executors call AI providers, webhooks, or HTTP endpoints as needed.
5. Durable Objects track execution status for real-time monitoring.
6. Final logs and execution status are stored in PostgreSQL.

## Current Node Categories

- Trigger nodes: Manual Trigger, HTTP Webhook Trigger, Google Form Trigger
- AI nodes: OpenAI, Anthropic, Gemini
- Utility/action nodes: HTTP Request, Slack, Discord

## Notes

- This repository is production-style monorepo build and still evolving.
- Some workspace-level scripts depend on package-specific scripts being present.
- Secrets should be supplied through environment variables and never committed.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

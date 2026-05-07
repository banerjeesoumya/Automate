# Backend

This package contains the Automate backend API. It is built with Hono and runs on Cloudflare Workers. The backend is responsible for authentication-related API flows, workflow CRUD operations, execution triggering, external trigger ingestion, execution history, template APIs, and coordination with Cloudflare Workflows and Durable Objects.

## Responsibilities

- Expose REST endpoints for workflows, credentials, templates, executions, and auth
- Start durable workflow runs through Cloudflare Workflows
- Track execution state through Durable Objects
- Validate authenticated requests
- Read and persist workflow data through the shared Prisma database layer

## Tech Stack

- Hono
- Cloudflare Workers
- Cloudflare Workflows
- Cloudflare Durable Objects
- Prisma ORM + Prisma Accelerate
- PostgreSQL on Neon

## Prerequisites

- Node.js 18+
- pnpm 10+
- Wrangler CLI
- Neon PostgreSQL database
- Prisma Accelerate connection string

## Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL=""
CONNECTION_POOL_URL=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_GENERATIVE_AI_API_KEY=""
```

If your local auth or provider setup requires extra values, keep them in the same file and avoid committing secrets.

## Install Dependencies

From the workspace root:

```bash
pnpm install
```

Or from this directory:

```bash
pnpm install
```

## Generate Prisma Client

The backend depends on the shared database package. Generate the Prisma client before first run:

```bash
pnpm --filter @repo/db generate
```

## Run in Development

From this directory:

```bash
pnpm dev
```

This starts the backend with `wrangler dev`.

Default local API base:

```text
http://127.0.0.1:8787/api
```

## Useful Commands

```bash
pnpm dev         # run the Worker locally
pnpm build       # build the Worker
pnpm deploy      # deploy to Cloudflare
pnpm cf-typegen  # generate Worker binding types
pnpm ngrok:dev   # expose local backend via ngrok
```

## Runtime Bindings

The Worker is configured in `wrangler.jsonc` and includes:

- `MY_WORKFLOW`: Cloudflare Workflow binding for durable execution
- `EXECUTION_STATE`: Durable Object binding for execution-state tracking

## Notes

- This package is intended to run together with the frontend, but it can be developed and tested independently.
- Database access is provided through the shared `@repo/db` package.
- Long-running workflow logic should stay in the execution layer rather than the request/response path.

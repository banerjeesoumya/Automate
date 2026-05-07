# Frontend

This package contains the Automate web application. It is built with Next.js 15 and provides the user-facing dashboard, visual workflow editor, authentication screens, template browser, credential manager, and execution-monitoring views.

## Responsibilities

- Render the dashboard and workflow list
- Provide the React Flow-based visual workflow editor
- Handle user authentication flows
- Manage credentials and templates
- Display execution history and real-time workflow status

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- shadcn/ui + Radix UI
- React Flow
- TanStack Query
- Better Auth

## Prerequisites

- Node.js 18+
- pnpm 10+
- Running backend API

## Environment Variables

Create `frontend/.env` with:

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

`NEXT_PUBLIC_BACKEND_URL` should point to the backend API, and `NEXT_PUBLIC_BACKEND_WS_URL` should point to the backend WebSocket-compatible execution-state endpoint.

## Install Dependencies

From the workspace root:

```bash
pnpm install
```

Or from this directory:

```bash
pnpm install
```

## Run in Development

From this directory:

```bash
pnpm dev
```

The app runs locally at:

```text
http://localhost:3000
```

## Useful Commands

```bash
pnpm dev     # start the Next.js dev server
pnpm build   # create a production build
pnpm start   # run the production build locally
pnpm lint    # run Biome checks
pnpm format  # apply Biome formatting
```

## Notes

- The app uses the Next.js App Router.
- The root route redirects to `/home`.
- The frontend depends on the backend for workflow execution, credential APIs, templates, and monitoring data.
- Real-time execution progress is displayed from backend execution-state updates.

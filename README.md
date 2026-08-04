# Next.js + Hono + Cloudflare Workers Template

A production-ready template for building Next.js applications with Hono API routes, deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).

## Features

- Next.js 16 with App Router
- Hono for API routes (mounted in the App Router via a catch-all route)
- Type-safe API client with `hono/client`
- Zod validation
- Tailwind CSS v4
- Deployed to Cloudflare Workers with `@opennextjs/cloudflare`
- CI/CD with GitHub Actions (deploys on push to `main`, preview URLs on PRs)

## Project structure

```
app/api/[[...routes]]/route.ts  # Hono app mounted in the App Router
server/hono/app.ts              # Hono app (basePath "/api")
server/hono/routes/             # Route handlers (hello, tasks)
lib/api-client.ts               # Type-safe API client
open-next.config.ts             # OpenNext Cloudflare config
wrangler.jsonc                  # Cloudflare Worker config
```

## Usage

1. Install dependencies:

```bash
bun install
```

2. Run the development server:

```bash
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

- `GET /api/hello` — returns a greeting
- `GET /api/tasks` — returns the task list
- `GET /api/tasks/:id` — returns a single task
- `POST /api/tasks` — creates a task (Zod-validated body)

### Typed client

The `hono/client`-based client in `lib/api-client.ts` gives you end-to-end type safety:

```ts
import { client } from "@/lib/api-client";

const res = await client.api.tasks.$get();
const tasks = await res.json();
```

## Checks

```bash
bun run check          # lint + typecheck + format check
bun run format:write   # auto-format
```

## Deployment

The entire Next.js app (frontend + API) is deployed as a single Cloudflare Worker.

1. Preview locally with the Cloudflare runtime:

```bash
bun run preview
```

2. Deploy to production:

```bash
bun run deploy
```

Requires `wrangler` to be authenticated. The included GitHub Actions workflow deploys automatically on push to `main`; set the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in your repository for CI deployments.

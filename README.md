# Flarestack

A production-ready template for building Next.js applications with Hono API routes, deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).

## Quick start

Scaffold a new app with the CLI:

```bash
npm create flarestack@latest
# or
pnpm create flarestack@latest my-app
# or scaffold into the current directory
pnpm create flarestack@latest .
```

The CLI asks for a project name (or takes one as an argument), auto-detects the package manager you invoked it with (npm/pnpm/bun/yarn), and optionally initializes git and installs dependencies.

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
cli/                            # create-flarestack CLI (published separately)
```

## Publishing the CLI

The CLI lives in `cli/` and is published to npm as `create-flarestack`.

1. Bump the version in `cli/package.json`.
2. Tag and push:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `Publish CLI to npm` workflow (`.github/workflows/publish.yml`) validates that the tag matches `cli/package.json`, then publishes with npm provenance. It can also be triggered manually from the Actions tab.

Set the `NPM_TOKEN` secret (an npm access token with publish permissions) in your repository settings.

## Usage

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
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
pnpm run check          # lint + typecheck + format check
pnpm run format:write   # auto-format
```

## Deployment

The entire Next.js app (frontend + API) is deployed as a single Cloudflare Worker.

1. Preview locally with the Cloudflare runtime:

```bash
pnpm run preview
```

2. Deploy to production:

```bash
pnpm run deploy
```

Requires `wrangler` to be authenticated. The included GitHub Actions workflow deploys automatically on push to `main`; set the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in your repository for CI deployments.

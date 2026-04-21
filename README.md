# Next.js + Hono + Cloudflare Workers Template

This template provides a production-ready setup for building Next.js applications with Hono API routes deployed on Cloudflare Workers.

## Features

- ✅ Next.js 15 with App Router
- ✅ Hono for API routes
- ✅ TypeScript support
- ✅ Zod validation
- ✅ Cloudflare Workers deployment
- ✅ API client generation with `hono/client`
- ✅ Production-ready configuration

## Usage

1. Run the development server:

```bash
bun dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3. Access the API at [http://localhost:3000/api/tasks](http://localhost:3000/api/tasks)

## Deployment

1. To deploy the backend to Cloudflare Workers, using the `wrangler` CLI:

```bash
bun deploy-backend
```

2. Set the worker url as the `NEXT_PUBLIC_APP_URL` environment variable in your Next.js application.

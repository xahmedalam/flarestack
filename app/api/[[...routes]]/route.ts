// app/api/[[...routes]]/route.ts
import app from "@/server/hono/app";
import { handle } from "hono/vercel";

export const runtime = "edge";

export default app as never;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// lib/api-client.ts
import type { AppType } from "@/server/hono/app";
import { hc } from "hono/client";

export const client = hc<AppType>("/");

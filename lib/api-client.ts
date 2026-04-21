// lib/api-client.ts
import type { AppType } from "@/server/hono/app";
import { hc } from "hono/client";
import { getAbsoluteUrl } from "./utils";

const apiBaseUrl = getAbsoluteUrl();
export const client = hc<AppType>(apiBaseUrl);

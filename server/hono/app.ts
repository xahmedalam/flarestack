// server/hono/app.ts
import { Hono } from "hono";
import { helloRoute } from "./routes/hello";
import { tasksRoute } from "./routes/tasks";

const app = new Hono().basePath("/api");

const routes = app.route("/tasks", tasksRoute).route("/hello", helloRoute);

export type AppType = typeof routes;
export default app;

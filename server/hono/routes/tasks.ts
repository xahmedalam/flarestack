// server/hono/routes/tasks.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

type Task = {
  id: number;
  title: string;
};

// In-memory storage for tasks (replace with a proper database in production)
const tasks: Task[] = [
  { id: 1, title: "Learn Hono" },
  { id: 2, title: "Use with Next.js" },
  { id: 3, title: "Build a REST API" },
];

const createTaskSchema = z.object({
  title: z.string().min(1),
});

export const tasksRoute = new Hono()
  .get("/", (c) => {
    return c.json(tasks);
  })
  .get("/:id", (c) => {
    const id = Number(c.req.param("id"));
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(task);
  })
  .post("/", zValidator("json", createTaskSchema), (c) => {
    const data = c.req.valid("json");

    const newTask: Task = {
      id: tasks.length + 1,
      title: data.title,
    };

    tasks.push(newTask);

    return c.json(newTask, 201);
  });

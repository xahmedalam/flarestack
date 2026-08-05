"use client";
import { client } from "@/lib/api-client";
import { useState } from "react";

type Task = {
  id: number;
  title: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function getTasks() {
    const res = await client.api.tasks.$get();
    const data = await res.json();
    setTasks(data);
    console.log(data);
  }

  return (
    <main>
      <h1>Next.js + Hono + Cloudflare Workers Stack</h1>
      <h2>---PR TEST---</h2>
      <button onClick={getTasks}>Get Tasks</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            ID: {task.id}, Title: {task.title}
          </li>
        ))}
      </ul>
    </main>
  );
}

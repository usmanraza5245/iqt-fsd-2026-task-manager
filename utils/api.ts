import type { Quote, Task } from "./types";

// Thin client-side wrapper around the REST API.

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  // 204 No Content has no body to parse.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type TaskInput = {
  title: string;
  description?: string;
  completed?: boolean;
};

export const api = {
  list(): Promise<Task[]> {
    return fetch("/api/tasks").then((r) => handle<Task[]>(r));
  },

  create(input: TaskInput): Promise<Task> {
    return fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<Task>(r));
  },

  update(id: number, input: Partial<TaskInput>): Promise<Task> {
    return fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<Task>(r));
  },

  remove(id: number): Promise<void> {
    return fetch(`/api/tasks/${id}`, { method: "DELETE" }).then((r) =>
      handle<void>(r),
    );
  },
};

/** Fetch the quote of the day (proxied server-side via /api/quote). */
export function fetchQuote(): Promise<Quote> {
  return fetch("/api/quote").then((r) => handle<Quote>(r));
}

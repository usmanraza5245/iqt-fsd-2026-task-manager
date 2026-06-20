# Task Manager

A simple full-stack task manager: add, edit, complete, and delete tasks.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma 7 · PostgreSQL

## Features

- Responsive task list (works on mobile and desktop)
- Add a task (title + optional description)
- Edit a task inline
- Mark a task as completed (with optimistic UI updates)
- Delete a task
- REST API backed by PostgreSQL via Prisma
- Shared input validation enforced on both the client and the server
- "Quote of the day" header, fetched from a public API (no key required)

## REST API

| Method   | Endpoint          | Description        |
| -------- | ----------------- | ------------------ |
| `GET`    | `/api/tasks`      | List all tasks     |
| `POST`   | `/api/tasks`      | Create a task      |
| `GET`    | `/api/tasks/:id`  | Get a single task  |
| `PUT`    | `/api/tasks/:id`  | Update a task      |
| `DELETE` | `/api/tasks/:id`  | Delete a task      |
| `GET`    | `/api/quote`      | Quote of the day   |

`/api/quote` is a thin server-side proxy over the public [ZenQuotes](https://zenquotes.io)
API. Proxying keeps the call server-side (no CORS, response cached for an hour) and
normalizes the upstream payload to `{ "text": "...", "author": "..." }`. No API key needed.

Request/response bodies are JSON. A task looks like:

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk and eggs",
  "completed": false,
  "createdAt": "2026-06-20T21:45:59.216Z",
  "updatedAt": "2026-06-20T21:45:59.216Z"
}
```

## Getting Started

### 1. Prerequisites

- Node.js 20.9+ (Next.js 16 requirement)
- A running PostgreSQL instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Copy the example env file and set your PostgreSQL connection string:

```bash
cp .env.example .env
```

```bash
# .env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_manager?schema=public"
```

> Note: With Prisma 7 the runtime connection uses a driver adapter (`@prisma/adapter-pg`)
> configured in `lib/prisma.ts`, while the Prisma CLI (migrations) reads the URL from
> `prisma.config.ts`. Both pick up `DATABASE_URL` from `.env`.

### 4. Run migrations

```bash
npx prisma migrate dev
```

This creates the `tasks` table and generates the Prisma client.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

Code is organized by responsibility — routing lives in `app/`, with components,
hooks, and utilities each in their own top-level folder:

```
app/
  api/tasks/route.ts        # GET (list) + POST (create)
  api/tasks/[id]/route.ts   # GET (one) + PUT (update) + DELETE
  api/quote/route.ts        # GET proxy for the public quote-of-the-day API
  layout.tsx                # Root layout
  page.tsx                  # Page shell (server component)
components/
  TaskManager.tsx           # Add-task form + list (presentational)
  TaskItem.tsx              # A single task row (view/edit), memoized
  QuoteBanner.tsx           # Quote of the day shown in the header
  fieldStyles.ts            # Shared Tailwind classes for form fields
hooks/
  useTasks.ts               # Task state + CRUD with optimistic updates & rollback
  useQuote.ts               # Loads the quote of the day (decorative, fails silently)
utils/
  api.ts                    # Typed fetch wrapper for the REST API + quote fetch
  validation.ts             # Shared input parsing + length limits (used by routes)
  getErrorMessage.ts        # Safe error-message extraction
  types.ts                  # Shared Task + Quote types
lib/prisma.ts               # PrismaClient singleton (with Postgres adapter)
prisma/schema.prisma        # Task model
prisma.config.ts            # Prisma 7 CLI config (migration datasource)
```

Imports use the `@/` path alias (e.g. `@/hooks/useTasks`, `@/utils/validation`).

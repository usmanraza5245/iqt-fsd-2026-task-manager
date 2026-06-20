import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUpdateInput } from "@/utils/validation";

type Context = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2025"
  );
}

// GET /api/tasks/:id — fetch a single task
export async function GET(_request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

// PUT /api/tasks/:id — update a task (title, description, completed)
export async function PUT(request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const parsed = parseUpdateInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const task = await prisma.task.update({ where: { id }, data: parsed.data });
    return NextResponse.json(task);
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error(`PUT /api/tasks/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/:id — delete a task
export async function DELETE(_request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error(`DELETE /api/tasks/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

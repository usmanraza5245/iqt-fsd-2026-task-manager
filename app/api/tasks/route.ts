import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCreateInput } from "@/utils/validation";

// GET /api/tasks — list all tasks (newest first)
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

// POST /api/tasks — create a task
export async function POST(request: Request) {
  try {
    const parsed = parseCreateInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const task = await prisma.task.create({ data: parsed.data });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

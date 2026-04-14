import { NextRequest, NextResponse } from "next/server";
import { fetchTasks, createTask, seedTasksIfEmpty } from "@/lib/notion";
import { requireAuth } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const seed = req.nextUrl.searchParams.get("seed") === "true";
    const tasks = seed ? await seedTasksIfEmpty() : await fetchTasks();
    return NextResponse.json(tasks);
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    return NextResponse.json({ error: "Notionからタスクを取得できませんでした" }, { status: 500 });
  }
}

const VALID_STATUSES = ["todo", "in-progress", "done", "blocked"];
const VALID_PRIORITIES = ["high", "medium", "low"];

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();

    // Input validation
    if (!body.title || typeof body.title !== "string" || body.title.length > 200) {
      return NextResponse.json({ error: "タスク名が不正です（200文字以内）" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "ステータスが不正です" }, { status: 400 });
    }
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "優先度が不正です" }, { status: 400 });
    }

    const VALID_WORK_STYLES = ["online", "offline"];
    if (body.workStyle && !VALID_WORK_STYLES.includes(body.workStyle)) {
      return NextResponse.json({ error: "作業場所が不正です" }, { status: 400 });
    }

    const task = await createTask({
      title: body.title.trim(),
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignee: body.assignee || "ryo",
      startDate: body.startDate || undefined,
      dueDate: body.dueDate || undefined,
      parentId: body.parentId || undefined,
      workStyle: body.workStyle || undefined,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    return NextResponse.json({ error: "タスクの作成に失敗しました" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fetchTasks, createTask, seedTasksIfEmpty } from "@/lib/notion";

export async function GET(req: NextRequest) {
  try {
    const seed = req.nextUrl.searchParams.get("seed") === "true";
    const tasks = seed ? await seedTasksIfEmpty() : await fetchTasks();
    return NextResponse.json(tasks);
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    return NextResponse.json({ error: "Notionからタスクを取得できませんでした" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    return NextResponse.json({ error: "タスクの作成に失敗しました" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateNotionTask, deleteNotionTask, fetchTasks } from "@/lib/notion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    await updateNotionTask(id, updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/tasks/[id] error:", e);
    return NextResponse.json({ error: "タスクの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Also delete children
    const allTasks = await fetchTasks();
    const children = allTasks.filter((t) => t.parentId === id);
    for (const child of children) {
      await deleteNotionTask(child.id);
    }
    await deleteNotionTask(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/tasks/[id] error:", e);
    return NextResponse.json({ error: "タスクの削除に失敗しました" }, { status: 500 });
  }
}

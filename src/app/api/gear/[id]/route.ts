import { NextRequest, NextResponse } from "next/server";
import { updateNotionGearItem, deleteNotionGearItem } from "@/lib/notion";
import { requireAuth } from "@/lib/require-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const updates = await req.json();
    await updateNotionGearItem(id, updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/gear/[id] error:", e);
    return NextResponse.json({ error: "ギアアイテムの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    await deleteNotionGearItem(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/gear/[id] error:", e);
    return NextResponse.json({ error: "ギアアイテムの削除に失敗しました" }, { status: 500 });
  }
}

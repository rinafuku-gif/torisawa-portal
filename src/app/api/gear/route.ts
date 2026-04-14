import { NextRequest, NextResponse } from "next/server";
import { fetchGear, createGearItem, seedGearIfEmpty } from "@/lib/notion";
import { requireAuth } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const seed = req.nextUrl.searchParams.get("seed") === "true";
    const items = seed ? await seedGearIfEmpty() : await fetchGear();
    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/gear error:", e);
    const message = e instanceof Error && e.message.includes("object_not_found")
      ? "ギアDBがNotionインテグレーションと共有されていません。Notionの設定を確認してください"
      : "Notionからギアデータを取得できませんでした";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const VALID_STATUSES = ["選定中", "未発注", "発注済", "到着済", "設置済"];
const VALID_PRIORITIES = ["必須", "推奨", "あれば◎", "検討中"];

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();

    // Input validation
    if (!body.name || typeof body.name !== "string" || body.name.length > 100) {
      return NextResponse.json({ error: "品目名が不正です（100文字以内）" }, { status: 400 });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "ステータスが不正です" }, { status: 400 });
    }
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "優先度が不正です" }, { status: 400 });
    }
    if (body.price !== undefined && (typeof body.price !== "number" || body.price < 0 || body.price > 10_000_000)) {
      return NextResponse.json({ error: "価格が不正です" }, { status: 400 });
    }

    const item = await createGearItem({
      name: body.name.trim(),
      category: body.category || "その他",
      product: body.product || "",
      price: body.price || 0,
      quantity: body.quantity || 1,
      status: body.status || "未発注",
      priority: body.priority || "推奨",
      note: body.note || "",
      shopUrl: body.shopUrl || undefined,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("POST /api/gear error:", e);
    return NextResponse.json({ error: "ギアアイテムの作成に失敗しました" }, { status: 500 });
  }
}

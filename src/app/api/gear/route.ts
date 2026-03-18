import { NextRequest, NextResponse } from "next/server";
import { fetchGear, createGearItem, seedGearIfEmpty } from "@/lib/notion";

export async function GET(req: NextRequest) {
  try {
    const seed = req.nextUrl.searchParams.get("seed") === "true";
    const items = seed ? await seedGearIfEmpty() : await fetchGear();
    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/gear error:", e);
    return NextResponse.json({ error: "Notionからギアデータを取得できませんでした" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await createGearItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("POST /api/gear error:", e);
    return NextResponse.json({ error: "ギアアイテムの作成に失敗しました" }, { status: 500 });
  }
}

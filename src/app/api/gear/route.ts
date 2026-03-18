import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { defaultGearItems, type GearItem } from "@/lib/gear-types";

const BLOB_PREFIX = "torisawa-gear-state.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(defaultGearItems);
  } catch {
    return NextResponse.json(defaultGearItems);
  }
}

export async function PUT(request: Request) {
  try {
    const items: GearItem[] = await request.json();
    const blob = await put(BLOB_PREFIX, JSON.stringify(items), {
      access: "public",
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

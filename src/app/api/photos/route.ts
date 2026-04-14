import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { requireAuth } from "@/lib/require-auth";

const META_KEY = "photos/meta.json";

interface PhotoMeta {
  id: string;
  blobUrl: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
}

async function getMetadata(): Promise<PhotoMeta[]> {
  try {
    const { blobs } = await list({ prefix: META_KEY });
    const metaBlob = blobs.find((b) => b.pathname === META_KEY);
    if (!metaBlob) return [];
    const res = await fetch(metaBlob.url);
    return res.json();
  } catch {
    return [];
  }
}

async function saveMetadata(photos: PhotoMeta[]): Promise<void> {
  // Delete old meta file first
  try {
    const { blobs } = await list({ prefix: META_KEY });
    for (const b of blobs) {
      if (b.pathname === META_KEY) await del(b.url);
    }
  } catch {
    // Ignore deletion errors
  }
  await put(META_KEY, JSON.stringify(photos), {
    access: "public",
    contentType: "application/json",
  });
}

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const photos = await getMetadata();
    return NextResponse.json(photos);
  } catch (e) {
    console.error("GET /api/photos error:", e);
    return NextResponse.json(
      { error: "写真データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const category = (formData.get("category") as string) || "その他";
    const uploadedBy = (formData.get("uploadedBy") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが必要です" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    const id = `photo_${Date.now()}`;
    const ext = file.name.split(".").pop() || "jpg";
    const pathname = `photos/${id}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    const photo: PhotoMeta = {
      id,
      blobUrl: blob.url,
      caption,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      category,
    };

    const existing = await getMetadata();
    await saveMetadata([photo, ...existing]);

    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    console.error("POST /api/photos error:", e);
    return NextResponse.json(
      { error: "写真のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    const existing = await getMetadata();
    const target = existing.find((p) => p.id === id);
    if (!target) {
      return NextResponse.json(
        { error: "写真が見つかりません" },
        { status: 404 }
      );
    }

    // Delete blob
    try {
      await del(target.blobUrl);
    } catch {
      // Blob may already be deleted
    }

    // Update metadata
    await saveMetadata(existing.filter((p) => p.id !== id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/photos error:", e);
    return NextResponse.json(
      { error: "写真の削除に失敗しました" },
      { status: 500 }
    );
  }
}

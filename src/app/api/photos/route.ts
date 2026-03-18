import { list, put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { SitePhoto } from "@/lib/gear-types";

const META_PREFIX = "torisawa-photos-meta.json";

async function getPhotosMeta(): Promise<SitePhoto[]> {
  try {
    const { blobs } = await list({ prefix: META_PREFIX });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      return await res.json();
    }
  } catch {
    // ignore
  }
  return [];
}

async function savePhotosMeta(photos: SitePhoto[]) {
  await put(META_PREFIX, JSON.stringify(photos), {
    access: "public",
    addRandomSuffix: false,
  });
}

export async function GET() {
  const photos = await getPhotosMeta();
  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const category = (formData.get("category") as string) || "その他";
    const uploadedBy = (formData.get("uploadedBy") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const id = `photo_${Date.now()}`;
    const ext = file.name.split(".").pop() || "jpg";
    const blobPath = `torisawa-photos/${id}.${ext}`;

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
    });

    const photo: SitePhoto = {
      id,
      url: blob.url,
      caption,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      category,
    };

    const photos = await getPhotosMeta();
    photos.unshift(photo);
    await savePhotosMeta(photos);

    return NextResponse.json(photo);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const photos = await getPhotosMeta();
    const target = photos.find((p) => p.id === id);

    if (target) {
      try {
        await del(target.url);
      } catch {
        // blob may already be deleted
      }
      const updated = photos.filter((p) => p.id !== id);
      await savePhotosMeta(updated);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

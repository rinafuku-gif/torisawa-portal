"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { type SitePhoto, photoCategories } from "@/lib/gear-types";

export function SitePhotosTab() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(photoCategories[0]);
  const [viewPhoto, setViewPhoto] = useState<SitePhoto | null>(null);
  const [catFilter, setCatFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/photos");
      if (res.ok) setPhotos(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Compress image client-side
      const compressed = await compressImage(file, 1200, 0.8);

      const formData = new FormData();
      formData.append("file", compressed, file.name);
      formData.append("caption", caption);
      formData.append("category", category);
      formData.append("uploadedBy", user.name);

      const res = await fetch("/api/photos", { method: "POST", body: formData });
      if (res.ok) {
        const photo = await res.json();
        setPhotos((prev) => [photo, ...prev]);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setViewPhoto(null);
    } catch {
      // ignore
    }
  }

  if (!user) return null;

  const filtered = catFilter === "all" ? photos : photos.filter((p) => p.category === catFilter);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">現場共有</h2>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h3 className="font-bold text-stone-800 text-sm">写真をアップロード</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
            >
              {photoCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="キャプション（例: 有孔ボード設置完了）"
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {uploading ? "アップロード中..." : "アップロード"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter("all")}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
            catFilter === "all" ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-600"
          }`}
        >
          全て ({photos.length})
        </button>
        {photoCategories.map((c) => {
          const count = photos.filter((p) => p.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              onClick={() => setCatFilter(catFilter === c ? "all" : c)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                catFilter === c ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-600"
              }`}
            >
              {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          {photos.length === 0 ? "まだ写真がありません。現場の状況を撮影してアップロードしましょう！" : "該当する写真がありません"}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setViewPhoto(photo)}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all text-left group"
            >
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-stone-800 line-clamp-1">
                  {photo.caption || "（キャプションなし）"}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-orange-600">{photo.category}</span>
                  <span className="text-xs text-stone-400">
                    {new Date(photo.uploadedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setViewPhoto(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-800">{viewPhoto.caption || "写真"}</h3>
                <div className="text-xs text-stone-500 mt-0.5">
                  {viewPhoto.uploadedBy} / {new Date(viewPhoto.uploadedAt).toLocaleString("ja-JP")} / {viewPhoto.category}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(viewPhoto.id)}
                  className="text-xs text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50"
                >
                  削除
                </button>
                <button
                  onClick={() => setViewPhoto(null)}
                  className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewPhoto.url} alt={viewPhoto.caption} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

async function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

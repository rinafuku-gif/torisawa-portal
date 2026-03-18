"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  type GearItem,
  type GearComment,
  type GearStatus,
  type GearPriority,
  gearStatuses,
  defaultGearItems,
} from "@/lib/gear-types";

const GEAR_STORAGE_KEY = "torisawa-gear-data";

function loadGear(): GearItem[] {
  if (typeof window === "undefined") return defaultGearItems;
  try {
    const raw = localStorage.getItem(GEAR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultGearItems;
}

function saveGear(items: GearItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(items));
}

export function GearTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<GearItem[]>(() => loadGear());
  const initialized = useRef(false);
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Auto-save whenever items change
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    saveGear(items);
  }, [items]);

  function updateItem(id: string, updates: Partial<GearItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    if (updates.status !== undefined || Object.keys(updates).length > 1) {
      setEditingId(null);
    }
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
  }

  function addItem(item: Omit<GearItem, "id">) {
    const id = `g_${Date.now()}`;
    setItems((prev) => [...prev, { ...item, id }]);
    setShowAddForm(false);
  }

  if (!user) return null;

  const categories = [...new Set(items.map((i) => i.category))];
  const filtered = items.filter(
    (i) =>
      (catFilter === "all" || i.category === catFilter) &&
      (statusFilter === "all" || i.status === statusFilter)
  );

  const totalCost = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const arrivedCost = items
    .filter((i) => i.status === "到着済" || i.status === "設置済")
    .reduce((s, i) => s + i.price * i.quantity, 0);
  const orderedCount = items.filter((i) => i.status === "発注済").length;
  const pendingCount = items.filter((i) => i.status === "未発注").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-800">ギア管理</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ステータスをクリックで変更。編集ボタンで詳細を修正できます
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-sm px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          + アイテム追加
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-3 text-center">
          <div className="text-2xl font-bold text-stone-800">{items.filter((i) => i.status === "選定中").length}</div>
          <div className="text-xs text-purple-700">選定中</div>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 text-center">
          <div className="text-2xl font-bold text-stone-800">{pendingCount}</div>
          <div className="text-xs text-stone-600">未発注</div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
          <div className="text-2xl font-bold text-stone-800">{orderedCount}</div>
          <div className="text-xs text-amber-700">発注済</div>
        </div>
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-3 text-center">
          <div className="text-2xl font-bold text-stone-800">{items.filter((i) => i.status === "到着済").length}</div>
          <div className="text-xs text-sky-700">到着済</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
          <div className="text-lg font-bold text-stone-800">
            ¥{arrivedCost.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700">
            確保済 / ¥{totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="all">全カテゴリ</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="all">全ステータス</option>
          {gearStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <AddGearForm
          categories={categories}
          onAdd={addItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Gear List by Category */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-stone-400">アイテムがありません</div>
      ) : (
        categories
          .filter((c) => catFilter === "all" || c === catFilter)
          .map((cat) => {
            const catItems = filtered.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            const catTotal = catItems.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <div key={cat} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="font-bold text-stone-700 text-sm">{cat}</h3>
                  <span className="text-xs text-stone-500">
                    {catItems.length}点 / ¥{catTotal.toLocaleString()}
                  </span>
                </div>
                <div className="divide-y divide-stone-100">
                  {catItems.map((item) =>
                    editingId === item.id ? (
                      <EditGearRow
                        key={item.id}
                        item={item}
                        categories={categories}
                        onSave={(u) => updateItem(item.id, u)}
                        onCancel={() => setEditingId(null)}
                        onDelete={() => deleteItem(item.id)}
                      />
                    ) : (
                      <GearRow
                        key={item.id}
                        item={item}
                        userName={user.name}
                        onStatusChange={(s) => updateItem(item.id, { status: s })}
                        onEdit={() => setEditingId(item.id)}
                        onAddComment={(text) => {
                          const comment: GearComment = { id: `c_${Date.now()}`, text, by: user.name, at: new Date().toISOString() };
                          updateItem(item.id, { comments: [...(item.comments || []), comment] });
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}

function GearRow({
  item,
  userName,
  onStatusChange,
  onEdit,
  onAddComment,
}: {
  item: GearItem;
  userName: string;
  onStatusChange: (s: GearStatus) => void;
  onEdit: () => void;
  onAddComment: (text: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const statusStyle = gearStatuses.find((s) => s.value === item.status) || gearStatuses[0];
  const isSelecting = item.status === "選定中";
  const comments = item.comments || [];

  function handleAddComment() {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText("");
  }

  return (
    <div>
      <div className={`px-5 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors group ${isSelecting ? "bg-purple-50/50" : ""}`}>
        <select
          value={item.status}
          onChange={(e) => onStatusChange(e.target.value as GearStatus)}
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 transition-all border-0 cursor-pointer ${statusStyle.color}`}
        >
          {gearStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isSelecting ? "text-purple-800" : "text-stone-800"}`}>{item.name}</span>
            {isSelecting && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-700 font-medium">稲福が選定中 - 発注不可</span>
            )}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {item.product}
            {item.note && <span className="ml-2 text-stone-400">({item.note})</span>}
          </div>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-sm font-medium text-stone-700">
            ¥{(item.price * item.quantity).toLocaleString()}
          </div>
          <div className="text-xs text-stone-400">
            {item.quantity > 1 && `¥${item.price.toLocaleString()} × ${item.quantity}`}
          </div>
        </div>
        {item.shopUrl && !isSelecting && (
          <a
            href={item.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-500 hover:text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50 transition-all shrink-0"
            title="購入リンク"
          >
            🛒
          </a>
        )}
        {item.shopUrl && isSelecting && (
          <span className="text-xs text-stone-300 px-2 py-1 shrink-0 cursor-not-allowed" title="選定中のため発注できません">🛒</span>
        )}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`text-xs px-2 py-1 rounded-lg transition-all shrink-0 ${
            comments.length > 0
              ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
              : "opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          }`}
        >
          💬{comments.length > 0 && ` ${comments.length}`}
        </button>
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-all shrink-0"
        >
          編集
        </button>
      </div>
      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-3 bg-stone-50 border-t border-stone-100">
          {comments.length > 0 && (
            <div className="space-y-1.5 pt-2 pb-2">
              {comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-medium text-stone-700">{c.by}</span>
                  <span className="text-stone-400 ml-1.5">{new Date(c.at).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <p className="text-stone-600 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
              placeholder="コメントを入力..."
              className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <button
              onClick={handleAddComment}
              className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shrink-0"
            >
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditGearRow({
  item,
  categories,
  onSave,
  onCancel,
  onDelete,
}: {
  item: GearItem;
  categories: string[];
  onSave: (u: Partial<GearItem>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [product, setProduct] = useState(item.product);
  const [price, setPrice] = useState(String(item.price));
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [status, setStatus] = useState(item.status);
  const [priority, setPriority] = useState(item.priority);
  const [category, setCategory] = useState(item.category);
  const [note, setNote] = useState(item.note);
  const [shopUrl, setShopUrl] = useState(item.shopUrl || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="px-5 py-4 bg-orange-50 border-l-4 border-orange-400">
      <div className="grid gap-2 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="品目"
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="商品名"
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
        <div className="flex gap-2">
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="単価" type="number"
            className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="数" type="number"
            className="w-20 px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as GearStatus)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            {gearStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as GearPriority)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            <option value="必須">必須</option><option value="推奨">推奨</option>
            <option value="あれば◎">あれば◎</option><option value="検討中">検討中</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="備考"
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
        </div>
        <div className="md:col-span-2">
          <input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="購入リンク（URL）"
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-500">削除しますか？</span>
              <button onClick={onDelete} className="text-xs px-3 py-1 bg-rose-500 text-white rounded-lg">削除</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-3 py-1 text-stone-500">やめる</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-rose-400 hover:text-rose-600">削除</button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="text-xs px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
          <button
            onClick={() => onSave({ name, product, price: Number(price), quantity: Number(quantity), status, priority, category, note, shopUrl: shopUrl || undefined })}
            className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >保存</button>
        </div>
      </div>
    </div>
  );
}

function AddGearForm({
  categories,
  onAdd,
  onCancel,
}: {
  categories: string[];
  onAdd: (item: Omit<GearItem, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState(categories[0] || "その他");
  const [priority, setPriority] = useState<GearPriority>("推奨");
  const [note, setNote] = useState("");

  return (
    <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 space-y-3">
      <h3 className="font-bold text-stone-800">アイテムを追加</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="品目名"
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm" autoFocus />
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="商品名・型番"
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm" />
        <div className="flex gap-2">
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="単価" type="number"
            className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm" />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="数量" type="number"
            className="w-20 px-3 py-2 border border-stone-200 rounded-lg text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-2 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="その他">その他</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as GearPriority)}
            className="flex-1 px-2 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            <option value="必須">必須</option><option value="推奨">推奨</option>
            <option value="あれば◎">あれば◎</option><option value="検討中">検討中</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="備考（任意）"
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            onAdd({ name, product, price: Number(price) || 0, quantity: Number(quantity) || 1, status: "未発注", priority, category, note });
          }}
          className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >追加</button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { getMemberById, members, type Task } from "@/lib/data";

const statusFlow: Record<string, string> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
  blocked: "todo",
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  todo: { label: "未着手", bg: "bg-stone-100", text: "text-stone-600" },
  "in-progress": { label: "進行中", bg: "bg-orange-100", text: "text-orange-700" },
  done: { label: "完了", bg: "bg-emerald-100", text: "text-emerald-700" },
  blocked: { label: "ブロック", bg: "bg-rose-100", text: "text-rose-700" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "高", color: "text-rose-500" },
  medium: { label: "中", color: "text-amber-500" },
  low: { label: "低", color: "text-stone-400" },
};

export function TasksTab() {
  const { user } = useAuth();
  const store = useStore();
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!user) return null;

  let visibleTasks = [...store.tasks];

  if (filter === "mine") {
    visibleTasks = visibleTasks.filter((t) => t.assignee === user.id);
  }

  if (statusFilter !== "all") {
    visibleTasks = visibleTasks.filter((t) => t.status === statusFilter);
  }

  const categories = [...new Set(visibleTasks.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-800">タスク管理</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "mine")}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="all">全員</option>
            <option value="mine">自分</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="all">全ステータス</option>
            <option value="todo">未着手</option>
            <option value="in-progress">進行中</option>
            <option value="done">完了</option>
            <option value="blocked">ブロック</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            + タスク追加
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {(["todo", "in-progress", "done", "blocked"] as const).map((s) => {
          const config = statusConfig[s];
          const count = store.tasks.filter((t) => t.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-xl border p-3 text-center transition-all ${
                statusFilter === s
                  ? `${config.bg} border-current ring-1`
                  : "bg-white border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div className="text-2xl font-bold text-stone-800">{count}</div>
              <div className={`text-xs font-medium ${config.text}`}>{config.label}</div>
            </button>
          );
        })}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <AddTaskForm
          onAdd={(task) => { store.addTask(task); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Tasks by Category */}
      {categories.map((cat) => {
        const catTasks = visibleTasks.filter((t) => t.category === cat);
        if (catTasks.length === 0) return null;
        return (
          <div key={cat} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
              <h3 className="font-bold text-stone-700 text-sm">{cat}</h3>
            </div>
            <div className="divide-y divide-stone-100">
              {catTasks.map((t) => {
                const status = statusConfig[t.status];
                const priority = priorityConfig[t.priority];
                const assignee = getMemberById(t.assignee);

                if (editingId === t.id) {
                  return (
                    <EditTaskRow
                      key={t.id}
                      task={t}
                      onSave={(updates) => { store.updateTask(t.id, updates); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => { store.deleteTask(t.id); setEditingId(null); }}
                    />
                  );
                }

                return (
                  <div
                    key={t.id}
                    className={`px-5 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors group ${
                      t.status === "done" ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      onClick={() => store.toggleTaskStatus(t.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        t.status === "done"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : t.status === "in-progress"
                          ? "border-orange-400 bg-orange-50"
                          : t.status === "blocked"
                          ? "border-rose-400 bg-rose-50"
                          : "border-stone-300 hover:border-orange-400"
                      }`}
                      title={`次のステータスへ: ${statusConfig[statusFlow[t.status]]?.label}`}
                    >
                      {t.status === "done" && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {t.status === "in-progress" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
                      {t.status === "blocked" && <span className="text-rose-500 text-xs font-bold">!</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-stone-400" : "text-stone-800"}`}>
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>{status.label}</span>
                        {t.dueDate && <span className="text-xs text-stone-400">期限: {t.dueDate.slice(5)}</span>}
                      </div>
                    </div>

                    <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
                    {assignee && <span className="text-lg" title={assignee.name}>{assignee.avatar}</span>}
                    <button
                      onClick={() => setEditingId(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-all"
                    >
                      編集
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {visibleTasks.length === 0 && (
        <div className="text-center py-12 text-stone-400">該当するタスクがありません</div>
      )}

      <div className="text-center text-xs text-stone-400 py-2">
        丸いボタンをクリック → 未着手 → 進行中 → 完了 とステータスが切り替わります
      </div>
    </div>
  );
}

function AddTaskForm({ onAdd, onCancel }: {
  onAdd: (task: Omit<Task, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("運営準備");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [assignee, setAssignee] = useState("ryo");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), status: "todo", priority, assignee, category, dueDate: dueDate || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 rounded-2xl border border-orange-200 p-5 space-y-4">
      <h3 className="font-bold text-stone-800">新しいタスクを追加</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">タスク名</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="タスクの内容を入力" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">カテゴリ</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            <option value="許認可">許認可</option>
            <option value="購入・施工">購入・施工</option>
            <option value="運営準備">運営準備</option>
            <option value="集客・掲載">集客・掲載</option>
            <option value="その他">その他</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">優先度</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">担当者</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">期限（任意）</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-sm px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
        <button type="submit" className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">追加する</button>
      </div>
    </form>
  );
}

function EditTaskRow({ task, onSave, onCancel, onDelete }: {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignee);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="px-5 py-4 bg-orange-50 border-l-4 border-orange-400">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="md:col-span-2">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            <option value="todo">未着手</option>
            <option value="in-progress">進行中</option>
            <option value="done">完了</option>
            <option value="blocked">ブロック</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div className="flex gap-2">
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs" />
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-500">本当に削除しますか？</span>
              <button onClick={onDelete} className="text-xs px-3 py-1 bg-rose-500 text-white rounded-lg">削除する</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-3 py-1 text-stone-500 hover:bg-stone-100 rounded-lg">やめる</button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-rose-400 hover:text-rose-600">削除</button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="text-xs px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
          <button
            onClick={() => onSave({ title, status, priority, assignee, dueDate: dueDate || undefined })}
            className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >保存</button>
        </div>
      </div>
    </div>
  );
}

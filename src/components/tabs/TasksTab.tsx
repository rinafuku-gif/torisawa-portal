"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { getMemberById, members, type Task } from "@/lib/data";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  todo: { label: "未着手", bg: "bg-stone-100", text: "text-stone-600" },
  "in-progress": { label: "進行中", bg: "bg-orange-100", text: "text-orange-700" },
  done: { label: "完了", bg: "bg-emerald-100", text: "text-emerald-700" },
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
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => new Set(
    store.getParentTasks().filter((p) => p.status !== "done").map((p) => p.id)
  ));
  const [showAddParent, setShowAddParent] = useState(false);
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!user) return null;

  if (store.tasksLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-stone-500">タスクを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (store.tasksError) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-500 mb-3">{store.tasksError}</p>
        <button onClick={store.refreshTasks} className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          再読み込み
        </button>
      </div>
    );
  }

  const parentTasks = store.getParentTasks();

  // Filter logic
  // 親タスク自身のステータス・担当者でフィルタリング（子がなくても表示対象になる）
  const filteredParents = parentTasks.filter((p) => {
    const children = store.getChildTasks(p.id);
    if (children.length > 0) {
      // 子タスクがある場合: 子に該当するものがあれば表示
      const relevantChildren = children.filter((c) => {
        if (filter === "mine" && c.assignee !== user.id) return false;
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        return true;
      });
      // 親自身もフィルター対象に含める（子がなくても親のステータスで判定）
      const parentMatches =
        (filter !== "mine" || p.assignee === user.id) &&
        (statusFilter === "all" || p.status === statusFilter);
      return relevantChildren.length > 0 || parentMatches;
    } else {
      // 子タスクがない独立タスク: 親自身のステータス・担当者で判定
      if (filter === "mine" && p.assignee !== user.id) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    }
  });

  function toggleExpanded(parentId: string) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }

  // Count all tasks for summary (親子リレーションの有無によらず全タスクを対象とする)
  // ただし、親タスクが子を持つ場合は子のみカウント（親は集計から除外してダブルカウントを防ぐ）
  const parentIds = new Set(parentTasks.filter((p) => store.getChildTasks(p.id).length > 0).map((p) => p.id));
  const allChildren = store.tasks.filter((t) => !parentIds.has(t.id));

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
          </select>
          <button
            onClick={() => setShowAddParent(true)}
            className="text-sm px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            + フェーズ追加
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["todo", "in-progress", "done"] as const).map((s) => {
          const config = statusConfig[s];
          const count = allChildren.filter((t) => t.status === s).length;
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

      {/* Add Parent Form */}
      {showAddParent && (
        <AddParentForm
          onAdd={(task) => { store.addTask(task); setShowAddParent(false); }}
          onCancel={() => setShowAddParent(false)}
        />
      )}

      {/* Hierarchical Task List */}
      {filteredParents.map((parent) => {
        const children = store.getChildTasks(parent.id);
        const isFlat = children.length === 0; // 子タスクなし = 独立タスク
        const filteredChildren = children.filter((c) => {
          if (filter === "mine" && c.assignee !== user.id) return false;
          if (statusFilter !== "all" && c.status !== statusFilter) return false;
          return true;
        });
        const doneCount = children.filter((c) => c.status === "done").length;
        const totalCount = children.length;
        const isExpanded = expandedParents.has(parent.id);
        const parentStatus = statusConfig[parent.status];
        const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        const assignee = getMemberById(parent.assignee);

        // 独立タスク（子なし）はシンプルな1行表示
        if (isFlat) {
          if (editingId === parent.id) {
            return (
              <EditTaskRow
                key={parent.id}
                task={parent}
                onSave={(updates) => { store.updateTask(parent.id, updates); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
                onDelete={() => { store.deleteTask(parent.id); setEditingId(null); }}
              />
            );
          }
          return (
            <div
              key={parent.id}
              className={`bg-white rounded-2xl border border-stone-200 px-5 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors group ${
                parent.status === "done" ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => store.toggleTaskStatus(parent.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  parent.status === "done"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : parent.status === "in-progress"
                    ? "border-orange-400 bg-orange-50"
                    : "border-stone-300 hover:border-orange-400"
                }`}
                title="ステータスを切り替え"
              >
                {parent.status === "done" && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {parent.status === "in-progress" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${parent.status === "done" ? "line-through text-stone-400" : "text-stone-800"}`}>
                  {parent.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${parentStatus.bg} ${parentStatus.text}`}>{parentStatus.label}</span>
                  {parent.startDate && parent.dueDate && (
                    <span className="text-xs text-stone-400">{parent.startDate.slice(5)} ~ {parent.dueDate.slice(5)}</span>
                  )}
                </div>
              </div>
              {assignee && <span className="text-lg" title={assignee.name}>{assignee.avatar}</span>}
              <button
                onClick={() => setEditingId(parent.id)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-all"
              >
                編集
              </button>
            </div>
          );
        }

        return (
          <div key={parent.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {/* Parent Header */}
            <button
              onClick={() => toggleExpanded(parent.id)}
              className={`w-full px-5 py-3 flex items-center gap-3 border-b transition-colors ${
                parent.status === "done"
                  ? "bg-emerald-50 border-emerald-200"
                  : parent.status === "in-progress"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-stone-50 border-stone-200"
              }`}
            >
              <svg
                className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${parent.status === "done" ? "line-through text-stone-500" : "text-stone-800"}`}>
                    {parent.title}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${parentStatus.bg} ${parentStatus.text}`}>
                    {parentStatus.label}
                  </span>
                </div>
                {parent.startDate && parent.dueDate && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    {parent.startDate.slice(5)} ~ {parent.dueDate.slice(5)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-stone-500">{doneCount}/{totalCount}</span>
                <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${parent.status === "done" ? "bg-emerald-400" : "bg-orange-400"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Children */}
            {isExpanded && (
              <div className="divide-y divide-stone-100">
                {filteredChildren.map((t) => {
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
                      <div className="w-4" /> {/* indent */}
                      <button
                        onClick={() => store.toggleTaskStatus(t.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          t.status === "done"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : t.status === "in-progress"
                            ? "border-orange-400 bg-orange-50"
                            : "border-stone-300 hover:border-orange-400"
                        }`}
                        title="ステータスを切り替え"
                      >
                        {t.status === "done" && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {t.status === "in-progress" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-stone-400" : "text-stone-800"}`}>
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>{status.label}</span>
                          {t.workStyle && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              t.workStyle === "online"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {t.workStyle === "online" ? "オンライン" : "オフライン"}
                            </span>
                          )}
                          {t.startDate && t.dueDate && (
                            <span className="text-xs text-stone-400">{t.startDate.slice(5)} ~ {t.dueDate.slice(5)}</span>
                          )}
                        </div>
                      </div>

                      <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
                      {assignee && <span className="text-lg" title={assignee.name}>{assignee.avatar}</span>}
                      <button
                        onClick={() => setEditingId(t.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-all"
                      >
                        編集
                      </button>
                    </div>
                  );
                })}

                {/* Add child task button */}
                {addingChildTo === parent.id ? (
                  <AddChildForm
                    parentId={parent.id}
                    onAdd={(task) => { store.addTask(task); setAddingChildTo(null); }}
                    onCancel={() => setAddingChildTo(null)}
                  />
                ) : (
                  <div className="px-5 py-2">
                    <button
                      onClick={() => setAddingChildTo(parent.id)}
                      className="text-xs text-stone-400 hover:text-orange-500 transition-colors pl-4"
                    >
                      + タスクを追加
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {filteredParents.length === 0 && (
        <div className="text-center py-12 text-stone-400">該当するタスクがありません</div>
      )}

      <div className="text-center text-xs text-stone-400 py-2">
        丸いボタンをクリック → 未着手 → 進行中 → 完了 とステータスが切り替わります
      </div>
    </div>
  );
}

function AddParentForm({ onAdd, onCancel }: {
  onAdd: (task: Omit<Task, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("ryo");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      status: "todo",
      priority: "medium",
      assignee,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 rounded-2xl border border-orange-200 p-5 space-y-4">
      <h3 className="font-bold text-stone-800">新しいフェーズを追加</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">フェーズ名</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="例: Phase 8: 追加対応" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">担当者</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white">
            {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-stone-600 mb-1">開始日</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-stone-600 mb-1">期限</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-sm px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
        <button type="submit" className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">追加する</button>
      </div>
    </form>
  );
}

function AddChildForm({ parentId, onAdd, onCancel }: {
  parentId: string;
  onAdd: (task: Omit<Task, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [assignee, setAssignee] = useState("ryo");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      status: "todo",
      priority,
      assignee,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      parentId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 bg-orange-50 border-l-4 border-orange-400">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="md:col-span-2">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="タスク名" autoFocus />
        </div>
        <div className="flex gap-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs" placeholder="開始日" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs" placeholder="期限" />
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
        <button type="submit" className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">追加</button>
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
  const [startDate, setStartDate] = useState(task.startDate || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [workStyle, setWorkStyle] = useState<"online" | "offline" | "">(task.workStyle || "");
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
          <select value={workStyle} onChange={(e) => setWorkStyle(e.target.value as "online" | "offline" | "")}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs bg-white">
            <option value="">場所: 未設定</option>
            <option value="online">オンライン</option>
            <option value="offline">オフライン</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs" />
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
            onClick={() => onSave({ title, status, priority, assignee, startDate: startDate || undefined, dueDate: dueDate || undefined, workStyle: workStyle || undefined })}
            className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >保存</button>
        </div>
      </div>
    </div>
  );
}

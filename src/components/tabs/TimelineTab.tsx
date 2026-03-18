"use client";

import { useStore } from "@/lib/store";

export function TimelineTab() {
  const store = useStore();

  function cycleMilestoneStatus(id: string, current: string) {
    const next = current === "upcoming" ? "in-progress" : current === "in-progress" ? "done" : "upcoming";
    store.updateMilestone(id, { status: next as "done" | "in-progress" | "upcoming" });
  }

  const doneCount = store.milestones.filter((m) => m.status === "done").length;
  const total = store.milestones.length;
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-800">タイムライン</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            丸をクリックでステータスを切り替え（予定 → 進行中 → 完了）
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-stone-700">{doneCount}/{total} 完了</div>
          <div className="w-24 h-1.5 bg-stone-200 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />

          <div className="space-y-0">
            {store.milestones.map((m) => {
              const dotColor =
                m.status === "done"
                  ? "bg-emerald-400"
                  : m.status === "in-progress"
                  ? "bg-orange-400 ring-4 ring-orange-100"
                  : "bg-stone-300 hover:bg-stone-400";

              const cardBg =
                m.status === "in-progress"
                  ? "bg-orange-50 border-orange-200"
                  : m.status === "done"
                  ? "bg-emerald-50 border-emerald-200 opacity-75"
                  : "bg-stone-50 border-stone-200";

              return (
                <div key={m.id} className="relative flex items-start gap-6 pb-8 last:pb-0">
                  <button
                    onClick={() => cycleMilestoneStatus(m.id, m.status)}
                    className={`relative z-10 w-8 h-8 rounded-full ${dotColor} flex items-center justify-center shrink-0 cursor-pointer transition-all`}
                    title={`クリックでステータス変更（現在: ${m.status === "done" ? "完了" : m.status === "in-progress" ? "進行中" : "予定"}）`}
                  >
                    {m.status === "done" && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {m.status === "in-progress" && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                  </button>

                  <div className={`flex-1 rounded-xl border p-4 ${cardBg}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold text-sm ${m.status === "done" ? "line-through text-stone-500" : "text-stone-800"}`}>
                        {m.title}
                      </h4>
                      <span className="text-xs text-stone-500 shrink-0 ml-2">{m.date}</span>
                    </div>
                    <p className="text-sm text-stone-600">{m.description}</p>
                    {m.assignee && (
                      <div className="mt-2 text-xs text-stone-400">担当: {m.assignee}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

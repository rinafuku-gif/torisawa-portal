"use client";

import { schedulePhases } from "@/lib/data";

const statusColors: Record<string, string> = {
  "完了": "bg-emerald-100 text-emerald-700",
  "進行中": "bg-orange-100 text-orange-700",
  "未着手": "bg-stone-100 text-stone-600",
};

export function ScheduleTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-stone-800">購入スケジュール</h2>
        <p className="text-xs text-stone-500 mt-0.5">2026年3月改訂版 - オープン準備の週次計画</p>
      </div>

      {/* Current Status Banner */}
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div>
            <div className="font-bold text-stone-800 text-sm">現在地</div>
            <div className="text-sm text-stone-600">
              消防適合通知書 到着待ち → 到着次第、保健所へ申請
            </div>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      {schedulePhases.map((phase, phaseIdx) => {
        const completedCount = phase.tasks.filter((t) => t.status === "完了").length;
        const totalCount = phase.tasks.length;
        const isComplete = completedCount === totalCount;
        const isActive = !isComplete && completedCount > 0;

        return (
          <div
            key={phaseIdx}
            className={`bg-white rounded-2xl border overflow-hidden ${
              isActive ? "border-orange-200 ring-1 ring-orange-100" : "border-stone-200"
            }`}
          >
            {/* Phase Header */}
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              isComplete ? "bg-emerald-50 border-emerald-200" :
              isActive ? "bg-orange-50 border-orange-200" :
              "bg-stone-50 border-stone-200"
            }`}>
              <div>
                <h3 className="font-bold text-stone-800 text-sm">{phase.period}</h3>
                <p className="text-xs text-stone-500">{phase.theme}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">{completedCount}/{totalCount}</span>
                <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-400" : "bg-orange-400"}`}
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="divide-y divide-stone-100">
              {phase.tasks.map((task, taskIdx) => {
                const statusColor = statusColors[task.status] || statusColors["未着手"];
                return (
                  <div key={taskIdx} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.status === "完了" ? "bg-emerald-400" :
                      task.status === "進行中" ? "bg-orange-400" :
                      "bg-stone-300"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${task.status === "完了" ? "line-through text-stone-400" : "text-stone-800"}`}>
                        {task.task}
                      </div>
                      {task.note && (
                        <div className="text-xs text-stone-400 mt-0.5">{task.note}</div>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 shrink-0">{task.assignee}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor}`}>
                      {task.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-stone-400 py-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> 完了
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" /> 進行中
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-300" /> 未着手
        </div>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { getMemberById } from "@/lib/data";

export function OverviewTab() {
  const { user } = useAuth();
  const store = useStore();

  if (!user) return null;

  // Only count child tasks (leaf tasks) for stats
  const childTasks = store.tasks.filter((t) => t.parentId);
  const todoCount = childTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = childTasks.filter((t) => t.status === "in-progress").length;
  const doneCount = childTasks.filter((t) => t.status === "done").length;
  const totalTasks = childTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Show parent tasks as milestones with progress
  const parentTasks = store.getParentTasks();
  const nextPhases = parentTasks.filter((p) => p.status !== "done").slice(0, 4);

  const urgentTasks = childTasks
    .filter((t) => t.priority === "high" && t.status !== "done")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-50 to-stone-50 rounded-2xl p-6 border border-orange-100">
        <h2 className="text-lg font-bold text-stone-800">
          {user.avatar} {user.name}さん
        </h2>
        <p className="text-stone-600 mt-1 text-sm">
          目標オープン: 2026年5月 | コンセプト: 街と山を繋ぐ、泊まれる道具箱
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="タスク進捗"
          value={`${progressPercent}%`}
          sub={`${doneCount}/${totalTasks} 完了`}
          color="orange"
          progress={progressPercent}
        />
        <StatCard
          label="進行中"
          value={`${inProgressCount}`}
          sub={`${todoCount} 未着手`}
          color="sky"
        />
        <StatCard
          label="損益分岐点"
          value="月8泊"
          sub="稼働率 26% で現賃貸超え"
          color="emerald"
        />
        <StatCard
          label="オーナー年間利益"
          value="約142万円"
          sub="標準シナリオ（稼働率35%）"
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span>🔥</span> 優先タスク
          </h3>
          <div className="space-y-2">
            {urgentTasks.map((t) => {
              const assignee = getMemberById(t.assignee);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <button
                    onClick={() => store.toggleTaskStatus(t.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      t.status === "done"
                        ? "bg-emerald-500 border-emerald-500"
                        : t.status === "in-progress"
                        ? "border-orange-400 bg-orange-50"
                        : "border-stone-300 hover:border-orange-400"
                    }`}
                    title="ステータスを切り替え"
                  >
                    {t.status === "done" && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {t.status === "in-progress" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-stone-400" : "text-stone-800"}`}>
                      {t.title}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {t.startDate && t.dueDate && `${t.startDate.slice(5)} ~ ${t.dueDate.slice(5)}`}
                    </div>
                  </div>
                  {assignee && <span className="text-sm">{assignee.avatar}</span>}
                </div>
              );
            })}
            {urgentTasks.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">
                優先タスクは全て完了しました！
              </p>
            )}
          </div>
        </div>

        {/* Next Phases (replacing milestones) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span>📅</span> 直近のマイルストーン
          </h3>
          <div className="space-y-2">
            {nextPhases.map((p) => {
              const children = store.getChildTasks(p.id);
              const childDone = children.filter((c) => c.status === "done").length;
              const childTotal = children.length;
              const pct = childTotal > 0 ? Math.round((childDone / childTotal) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stone-50"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    p.status === "in-progress"
                      ? "border-orange-400 bg-orange-50"
                      : "border-stone-300"
                  }`}>
                    {p.status === "in-progress" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm">{p.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500">{childDone}/{childTotal}</span>
                    </div>
                    {p.startDate && p.dueDate && (
                      <div className="text-xs text-stone-500 mt-0.5">
                        {p.startDate.slice(5)} ~ {p.dueDate.slice(5)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Structure */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span>💰</span> 経費構造
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
              <span className="text-sm text-stone-600">宿泊料金</span>
              <div className="flex gap-3 text-sm">
                <span className="text-stone-800 font-medium">オーナー 65%</span>
                <span className="text-stone-400">運営委託 35%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
              <span className="text-sm text-stone-600">ギアレンタル</span>
              <div className="flex gap-3 text-sm">
                <span className="text-stone-800 font-medium">オーナー 65%</span>
                <span className="text-stone-400">運営委託 35%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span>📊</span> 全体の進行度
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e7e5e4" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#f97316" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 3.14} ${314 - progressPercent * 3.14}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-stone-800">{progressPercent}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-stone-600">完了: {doneCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-stone-600">進行中: {inProgressCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-stone-300" />
                <span className="text-stone-600">未着手: {todoCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concept */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span>🧭</span> コンセプト＆方針
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ConceptCard
            title="泊まれる道具箱"
            items={[
              "無骨だけど親切なインダストリアル空間",
              "Snow Peak / Barebones等のハイスペックギア",
              "「未完成さ」を楽しむDIY感",
            ]}
            color="orange"
          />
          <ConceptCard
            title="ターゲット"
            items={[
              "30代 都心カップル・夫婦",
              "アウトドアに興味あるが道具を持っていない",
              "「丁寧な暮らし」への憧れ",
            ]}
            color="sky"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, color, progress,
}: {
  label: string; value: string; sub: string;
  color: "orange" | "sky" | "emerald" | "amber";
  progress?: number;
}) {
  const bgMap = {
    orange: "bg-orange-50 border-orange-100",
    sky: "bg-sky-50 border-sky-100",
    emerald: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
  };
  const barMap = {
    orange: "bg-orange-500",
    sky: "bg-sky-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
  };
  return (
    <div className={`rounded-2xl border p-4 ${bgMap[color]}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-2xl font-bold text-stone-800 mt-1">{value}</div>
      <div className="text-xs text-stone-500 mt-0.5">{sub}</div>
      {progress !== undefined && (
        <div className="h-1.5 bg-white/50 rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full ${barMap[color]} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  title, items, color,
}: {
  title: string; items: string[]; color: "orange" | "sky" | "emerald";
}) {
  const borderMap = { orange: "border-orange-200", sky: "border-sky-200", emerald: "border-emerald-200" };
  const bgMap = { orange: "bg-orange-50", sky: "bg-sky-50", emerald: "bg-emerald-50" };
  return (
    <div className={`rounded-xl border-2 p-4 ${borderMap[color]} ${bgMap[color]}`}>
      <h4 className="font-bold text-stone-800 mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-stone-600 flex items-start gap-1.5">
            <span className="text-stone-400 mt-0.5">-</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

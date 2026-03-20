"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getMemberById } from "@/lib/data";

const PROJECT_START = "2026-03-01";
const PROJECT_END = "2026-05-10";

function parseDate(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function daysBetween(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateShort(d: string): string {
  return d.slice(5); // MM-DD
}

const statusColors: Record<string, string> = {
  done: "bg-emerald-400",
  "in-progress": "bg-orange-400",
  todo: "bg-stone-300",
  blocked: "bg-rose-400",
};

const statusColorsParent: Record<string, string> = {
  done: "bg-emerald-600",
  "in-progress": "bg-orange-600",
  todo: "bg-stone-400",
  blocked: "bg-rose-600",
};

export function GanttTab() {
  const store = useStore();

  if (store.tasksLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-stone-500">ガントチャートを読み込み中...</p>
        </div>
      </div>
    );
  }

  const parentTasks = store.getParentTasks();

  const totalDays = daysBetween(PROJECT_START, PROJECT_END);
  const today = new Date().toISOString().slice(0, 10);
  const todayOffset = daysBetween(PROJECT_START, today);

  // Generate week markers
  const weeks = useMemo(() => {
    const result: { label: string; offset: number }[] = [];
    const start = parseDate(PROJECT_START);
    const end = parseDate(PROJECT_END);
    const current = new Date(start);
    // Align to Monday
    const dayOfWeek = current.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    current.setDate(current.getDate() + daysToMonday);

    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      const offset = daysBetween(PROJECT_START, dateStr);
      const m = current.getMonth() + 1;
      const d = current.getDate();
      result.push({ label: `${m}/${d}`, offset });
      current.setDate(current.getDate() + 7);
    }
    return result;
  }, []);

  // Generate month markers
  const months = useMemo(() => {
    const result: { label: string; offset: number; width: number }[] = [];
    const start = parseDate(PROJECT_START);
    const end = parseDate(PROJECT_END);
    let current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      const monthStart = current.toISOString().slice(0, 10);
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      const monthEnd = new Date(nextMonth.getTime() - 86400000).toISOString().slice(0, 10);

      const clampedStart = monthStart < PROJECT_START ? PROJECT_START : monthStart;
      const clampedEnd = monthEnd > PROJECT_END ? PROJECT_END : monthEnd;

      const offset = daysBetween(PROJECT_START, clampedStart);
      const width = daysBetween(clampedStart, clampedEnd) + 1;
      const m = current.getMonth() + 1;
      result.push({ label: `${current.getFullYear()}/${m}月`, offset, width });

      current = nextMonth;
    }
    return result;
  }, []);

  function getBarStyle(startDate?: string, dueDate?: string) {
    if (!startDate || !dueDate) return null;
    const clampedStart = startDate < PROJECT_START ? PROJECT_START : startDate;
    const clampedEnd = dueDate > PROJECT_END ? PROJECT_END : dueDate;
    const left = (daysBetween(PROJECT_START, clampedStart) / totalDays) * 100;
    const width = ((daysBetween(clampedStart, clampedEnd) + 1) / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  }

  const todayPct = (todayOffset / totalDays) * 100;
  const showToday = todayPct >= 0 && todayPct <= 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-stone-800">ガントチャート</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          プロジェクト期間: {formatDateShort(PROJECT_START)} ~ {formatDateShort(PROJECT_END)}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400" /> 完了</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-400" /> 進行中</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-300" /> 未着手</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-400" /> ブロック</div>
        <div className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-rose-500" /> 今日</div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Month Headers */}
          <div className="flex border-b border-stone-200">
            <div className="w-52 shrink-0 px-3 py-2 bg-stone-50 border-r border-stone-200" />
            <div className="flex-1 relative bg-stone-50">
              <div className="flex">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-stone-600 text-center py-2 border-r border-stone-200"
                    style={{ width: `${(m.width / totalDays) * 100}%` }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Week Headers */}
          <div className="flex border-b border-stone-200">
            <div className="w-52 shrink-0 px-3 py-1 bg-stone-50 border-r border-stone-200">
              <span className="text-xs text-stone-400">タスク</span>
            </div>
            <div className="flex-1 relative bg-stone-50">
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className="absolute text-[10px] text-stone-400 text-center"
                  style={{ left: `${(w.offset / totalDays) * 100}%`, width: `${(7 / totalDays) * 100}%` }}
                >
                  {w.label}
                </div>
              ))}
              <div className="h-5" />
            </div>
          </div>

          {/* Rows */}
          {parentTasks.map((parent) => {
            const children = store.getChildTasks(parent.id);
            const parentBar = getBarStyle(parent.startDate, parent.dueDate);

            return (
              <div key={parent.id}>
                {/* Parent row */}
                <div className="flex border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <div className="w-52 shrink-0 px-3 py-2.5 border-r border-stone-200 flex items-center gap-1.5">
                    <span className="font-bold text-xs text-stone-700 truncate">{parent.title}</span>
                  </div>
                  <div className="flex-1 relative py-2.5">
                    {/* Vertical week lines */}
                    {weeks.map((w, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-stone-100"
                        style={{ left: `${(w.offset / totalDays) * 100}%` }}
                      />
                    ))}
                    {/* Today line */}
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0 border-l-2 border-dashed border-rose-500 z-10"
                        style={{ left: `${todayPct}%` }}
                      />
                    )}
                    {/* Bar */}
                    {parentBar && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-4 rounded ${statusColorsParent[parent.status]} opacity-80`}
                        style={parentBar}
                      />
                    )}
                  </div>
                </div>

                {/* Child rows */}
                {children.map((child) => {
                  const childBar = getBarStyle(child.startDate, child.dueDate);
                  const assignee = getMemberById(child.assignee);

                  return (
                    <div key={child.id} className="flex border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <div className="w-52 shrink-0 px-3 py-2 border-r border-stone-200 flex items-center gap-1.5">
                        <span className="w-3" />
                        <span className={`text-xs truncate ${child.status === "done" ? "line-through text-stone-400" : "text-stone-600"}`}>
                          {child.title}
                        </span>
                        {assignee && <span className="text-xs shrink-0">{assignee.avatar}</span>}
                      </div>
                      <div className="flex-1 relative py-2">
                        {/* Vertical week lines */}
                        {weeks.map((w, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-stone-50"
                            style={{ left: `${(w.offset / totalDays) * 100}%` }}
                          />
                        ))}
                        {/* Today line */}
                        {showToday && (
                          <div
                            className="absolute top-0 bottom-0 border-l-2 border-dashed border-rose-500/30 z-10"
                            style={{ left: `${todayPct}%` }}
                          />
                        )}
                        {/* Bar */}
                        {childBar ? (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 h-2.5 rounded-sm ${statusColors[child.status]}`}
                            style={childBar}
                          />
                        ) : (
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 px-2">
                            <span className="text-[10px] text-stone-300">日程未定</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

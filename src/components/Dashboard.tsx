"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { OverviewTab } from "./tabs/OverviewTab";
import { TimelineTab } from "./tabs/TimelineTab";
import { TasksTab } from "./tabs/TasksTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { RevenueTab } from "./tabs/RevenueTab";
import { ScheduleTab } from "./tabs/ScheduleTab";

type Tab = "overview" | "timeline" | "tasks" | "documents" | "revenue" | "schedule";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "概要", icon: "📊" },
  { id: "timeline", label: "タイムライン", icon: "📅" },
  { id: "tasks", label: "タスク", icon: "✅" },
  { id: "documents", label: "資料", icon: "📁" },
  { id: "revenue", label: "収支計画", icon: "💰" },
  { id: "schedule", label: "購入スケジュール", icon: "🛒" },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏕️</span>
              <h1 className="font-bold text-stone-800 text-sm sm:text-base">
                Basecamp Torisawa
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{user.avatar}</span>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-stone-700">
                    {user.name}
                  </div>
                  <div className="text-xs text-stone-400">{user.roleLabel}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-14 z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-700"
                    : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "timeline" && <TimelineTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "schedule" && <ScheduleTab />}
      </main>
    </div>
  );
}

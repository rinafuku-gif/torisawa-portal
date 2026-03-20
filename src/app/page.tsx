"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { members } from "@/lib/data";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-stone-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LoginPage />;
}

function LoginPage() {
  const { login } = useAuth();
  const [selectedMember, setSelectedMember] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedMember) {
      setError("メンバーを選択してください");
      return;
    }
    setSubmitting(true);
    try {
      const success = await login(selectedMember, password);
      if (!success) {
        setError("パスワードが正しくありません");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏕️</div>
          <h1 className="text-2xl font-bold text-stone-800">
            Basecamp Torisawa
          </h1>
          <p className="text-stone-500 mt-1">プロジェクトポータル</p>
          <p className="text-xs text-stone-400 mt-1">街と山を繋ぐ、泊まれる道具箱</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              メンバー
            </label>
            <div className="grid gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMember(m.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedMember === m.id
                      ? "border-orange-400 bg-orange-50 ring-1 ring-orange-400"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <div className="font-medium text-stone-800">{m.name}</div>
                    <div className="text-xs text-stone-500">{m.roleLabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="パスワードを入力"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-4">
          大月市鳥沢 Basecamp Torisawa プロジェクト
        </p>
      </div>
    </div>
  );
}

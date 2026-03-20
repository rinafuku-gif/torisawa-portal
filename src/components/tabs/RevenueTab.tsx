"use client";

import { revenueScenarios } from "@/lib/data";

export function RevenueTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">収支計画</h2>

      {/* Key Numbers - オーナー視点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5">
          <div className="text-sm text-orange-700 font-medium">平均宿泊単価</div>
          <div className="text-2xl font-bold text-stone-800 mt-1">¥15,000/泊</div>
          <div className="text-xs text-orange-600 mt-1">2名込み基本料金</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
          <div className="text-sm text-emerald-700 font-medium">損益分岐点</div>
          <div className="text-2xl font-bold text-stone-800 mt-1">月8泊</div>
          <div className="text-xs text-emerald-600 mt-1">稼働率 26% で現賃貸超え</div>
        </div>
        <div className="bg-sky-50 rounded-2xl border border-sky-200 p-5">
          <div className="text-sm text-sky-700 font-medium">現賃貸収入</div>
          <div className="text-2xl font-bold text-stone-800 mt-1">¥75,000/月</div>
          <div className="text-xs text-sky-600 mt-1">比較基準</div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4">料金設定</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-4 py-2 font-medium text-stone-700"></th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">平日（日〜木）</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">休前日・繁忙期</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">戦略意図</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-2 font-medium text-stone-800">基本料金（2名込）</td>
                <td className="px-4 py-2 text-stone-600">¥12,500</td>
                <td className="px-4 py-2 text-stone-600">¥15,500</td>
                <td className="px-4 py-2 text-stone-500 text-xs">近隣相場より安価→稼働率重視</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-stone-800">追加（1名あたり）</td>
                <td className="px-4 py-2 text-stone-600">¥4,000</td>
                <td className="px-4 py-2 text-stone-600">¥4,000</td>
                <td className="px-4 py-2 text-stone-500 text-xs">グループ客単価UP</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-stone-800">清掃料金</td>
                <td className="px-4 py-2 text-stone-600">¥0</td>
                <td className="px-4 py-2 text-stone-600">¥0</td>
                <td className="px-4 py-2 text-stone-500 text-xs">表示価格を下げ転換率UP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Share - 控えめに */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4">経費構造</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-4 py-2 font-medium text-stone-700">売上項目</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">オーナー取り分</th>
                <th className="text-left px-4 py-2 font-medium text-stone-700">運営委託費</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="px-4 py-2 text-stone-800">宿泊料金</td>
                <td className="px-4 py-2 font-medium text-stone-800">65%</td>
                <td className="px-4 py-2 text-stone-500">35%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-stone-800">ギアレンタル</td>
                <td className="px-4 py-2 font-medium text-stone-800">65%</td>
                <td className="px-4 py-2 text-stone-500">35%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-stone-400 mt-3">※ 運営委託費には清掃・リネン代を含む</p>
      </div>

      {/* Monthly P&L - オーナー視点 */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4">月次収支シミュレーション</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-3 py-2 font-medium text-stone-700">シナリオ</th>
                <th className="text-left px-3 py-2 font-medium text-stone-700">稼働率</th>
                <th className="text-left px-3 py-2 font-medium text-stone-700">泊数</th>
                <th className="text-left px-3 py-2 font-medium text-stone-700">合計売上</th>
                <th className="text-left px-3 py-2 font-medium text-stone-700">オーナー手取り</th>
                <th className="text-left px-3 py-2 font-medium text-stone-500">運営委託費</th>
                <th className="text-left px-3 py-2 font-medium text-stone-700">vs 賃貸</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {revenueScenarios.map((s) => (
                <tr key={s.label} className={s.highlight ? "bg-orange-50 font-medium" : ""}>
                  <td className="px-3 py-2 text-stone-800">{s.label}</td>
                  <td className="px-3 py-2 text-stone-600">{s.occupancy}</td>
                  <td className="px-3 py-2 text-stone-600">{s.nights}</td>
                  <td className="px-3 py-2 text-stone-800 font-medium">{s.total}</td>
                  <td className="px-3 py-2 text-stone-800 font-medium">{s.ownerShare}</td>
                  <td className="px-3 py-2 text-stone-400">{s.ryoShare}</td>
                  <td className={`px-3 py-2 font-medium ${s.vsRent.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
                    {s.vsRent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-stone-400 mt-3">※ オーナー手取り = 売上 × 65%（運営委託費35%控除後）。繁忙期は休前日料金（¥15,500〜¥16,000/泊）で試算</p>
      </div>

      {/* Seasonal Strategy */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4">季節別戦略</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { season: "春 3-5月", target: "登山客・花見客", content: "扇山/百蔵山・桜キャンプ", rate: "35〜50%", color: "bg-emerald-50 border-emerald-200" },
            { season: "GW", target: "ファミリー・カップル", content: "手ぶらキャンプ・川遊び", rate: "70〜90%", color: "bg-orange-50 border-orange-200" },
            { season: "夏 6-8月", target: "ファミリー・川遊び客", content: "ラフティング・BBQ・花火", rate: "50〜70%", color: "bg-sky-50 border-sky-200" },
            { season: "秋 9-11月", target: "登山客・紅葉客", content: "紅葉登山・焚火ナイト", rate: "40〜60%", color: "bg-amber-50 border-amber-200" },
            { season: "冬 12-2月", target: "ワーケーション", content: "冬キャンプ・星空・長期割", rate: "15〜25%", color: "bg-stone-50 border-stone-200" },
          ].map((s) => (
            <div key={s.season} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="font-bold text-stone-800 text-sm">{s.season}</div>
              <div className="text-xs text-stone-500 mt-1">ターゲット: {s.target}</div>
              <div className="text-sm text-stone-600 mt-2">{s.content}</div>
              <div className="text-xs font-medium text-stone-700 mt-2">稼働率: {s.rate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-bold text-stone-800 mb-4">リスクと対策</h3>
        <div className="space-y-3">
          {[
            { risk: "冬季の低稼働", impact: "高", prob: "高", mitigation: "ワーケーション特化・焚火体験・長期割" },
            { risk: "オーナー収入＜賃貸の月", impact: "高", prob: "中", mitigation: "ギアレンタルで補填・年間で上回ればOK" },
            { risk: "ギア劣化・盗難・破損", impact: "中", prob: "中", mitigation: "デポジット制度・保険・メンテ計画" },
            { risk: "許可遅延", impact: "高", prob: "中", mitigation: "進捗フォロー・代替案準備" },
          ].map((r) => (
            <div key={r.risk} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-800">{r.risk}</div>
                <div className="text-xs text-stone-500 mt-0.5">影響: {r.impact} / 確率: {r.prob}</div>
              </div>
              <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                {r.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

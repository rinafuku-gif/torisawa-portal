/**
 * 「対応場所」未設定タスクを一括更新するスクリプト
 * Usage: node scripts/update-work-style.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local を手動パース
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Z_]+)="?(.+?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const TASKS_DB = process.env.NOTION_TASKS_DB_ID;
const NOTION_VERSION = "2022-06-28";

async function notionFetch(path, options = {}) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function queryAll() {
  const pages = [];
  let startCursor = undefined;
  do {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;
    const res = await notionFetch(`/databases/${TASKS_DB}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    pages.push(...res.results);
    startCursor = res.has_more ? res.next_cursor : undefined;
  } while (startCursor);
  return pages;
}

function getTitle(prop) {
  if (!prop || !prop.title) return "";
  return prop.title.map((t) => t.plain_text).join("");
}

function getSelect(prop) {
  if (!prop || !prop.select) return null;
  return prop.select.name ?? null;
}

// ─── 判定ロジック ───
function judgeWorkStyle(title) {
  const t = title;

  // スキップ（鳥沢ポータル無関係の日常タスク）
  const skipPatterns = [/お風呂/];
  if (skipPatterns.some((p) => p.test(t))) return null;

  // タイトルに明示的なヒントがある場合は最優先
  if (/遠隔可/.test(t)) return "オンライン";
  if (/現場作業/.test(t)) return "オフライン";

  // オフライン判定キーワード
  const offlinePatterns = [
    /DIY/,
    /施工/,
    /塗装/,
    /照明交換/,
    /設備設置/,
    /スマートロック.*設置/,
    /設置/,
    /Wi-Fi.*開通/,
    /開通/,
    /ギア.*配置/,
    /ディスプレイ.*配置/,
    /配置/,
    /清掃/,
    /テスト宿泊/,
    /写真撮影/,
    /現場確認/,
    /消火器/,
    /防炎カーテン/,
    /キッチン.*設置/,
    /備品設置/,
    /保健所立入/,
    /有孔ボード/,
    /資材購入/,
    /タブレット設定/,
    /エアコン設置/,
    /廃棄物.*契約/,
    /一般廃棄物/,
    /発注.*設置/,
  ];

  // オンライン判定キーワード
  const onlinePatterns = [
    /書類作成/,
    /OTA掲載文/,
    /Airbnb登録/,
    /Airbnb.*登録/,
    /料金設定/,
    /ハウスルール作成/,
    /規約作成/,
    /ガイド作成/,
    /フォーマット準備/,
    /デザイン/,
    /リサーチ/,
    /発注$/, // 末尾が発注のみ（Web注文）
    /中古品.*リサーチ/,
    /ギア.*選定/,
    /承認/,
    /集客/,
    /掲載/,
    /公開/,
    /予約受付/,
    /正規料金/,
    /本格運営/,
    /宿泊者名簿.*フォーマット/,
    /簡易宿所.*申請/,
    /営業許可申請/,
    /消防適合通知書/,
    /エアコン.*交渉/,
    /Phase \d+:/, // フェーズ親タスクはスキップ
    /GW期間/,
    /モニター価格/,
  ];

  if (offlinePatterns.some((p) => p.test(t))) return "オフライン";
  if (onlinePatterns.some((p) => p.test(t))) return "オンライン";

  // 判断微妙 → オフラインに寄せる
  return "オフライン";
}

async function main() {
  console.log("全タスクを取得中...\n");
  const pages = await queryAll();
  console.log(`取得件数: ${pages.length}\n`);

  // 「対応場所」が未設定のタスクを抽出
  const unset = pages.filter((p) => {
    const place = getSelect(p.properties["対応場所"]);
    return place === null || place === "";
  });

  console.log(`「対応場所」未設定タスク: ${unset.length} 件\n`);
  console.log("─".repeat(80));
  console.log("タスク名 → 判定 (理由)");
  console.log("─".repeat(80));

  const updates = [];

  for (const page of unset) {
    const title = getTitle(page.properties["タスク名"]);
    const judgment = judgeWorkStyle(title);

    if (judgment === null) {
      console.log(`[SKIP]  ${title}`);
      continue;
    }

    let reason = "";
    if (/遠隔可/.test(title)) reason = "タイトルに「遠隔可」";
    else if (/現場作業/.test(title)) reason = "タイトルに「現場作業」";
    else if (judgment === "オフライン") reason = "オフライン系キーワード一致 or デフォルト";
    else reason = "オンライン系キーワード一致";

    console.log(`[${judgment}]  ${title}  (${reason})`);
    updates.push({ id: page.id, title, judgment });
  }

  console.log("─".repeat(80));
  console.log(`\n更新対象: ${updates.length} 件\n`);

  if (updates.length === 0) {
    console.log("更新対象がありません。終了します。");
    return;
  }

  console.log("Notionを更新中...\n");
  let successCount = 0;
  let failCount = 0;

  for (const { id, title, judgment } of updates) {
    try {
      await notionFetch(`/pages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          properties: {
            "対応場所": { select: { name: judgment } },
          },
        }),
      });
      console.log(`[OK] ${title} → ${judgment}`);
      successCount++;
      // レート制限対策（0.35秒ウェイト）
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.error(`[NG] ${title}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n完了: 成功 ${successCount} 件 / 失敗 ${failCount} 件`);
}

main().catch((err) => {
  console.error("スクリプトエラー:", err);
  process.exit(1);
});

// Step 3: 新DBのオンライン/オフライン一括更新スクリプト
// 実行前に: Notion の新タスクDBをインテグレーション「Basecamp Torisawa」に共有すること

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = '500a3ff0-900d-4933-ba83-b511102f6779';

// 判定結果（手動調整済み）
const classifications = {
  "消防適合通知書の受領確認": "オンライン",
  "事業系一般廃棄物処理契約": "オンライン",
  "簡易宿所営業許可申請": "オンライン",
  "宿泊者名簿フォーマット準備（遠隔可・検査前必須）": "オンライン",
  "保健所立入検査": "オフライン",
  "ギア最終選定・オーナー承認": "オンライン",
  "防炎カーテン購入・設置": "オフライン",
  "中古品リサーチ・発注": "オンライン",
  "消火器 発注・設置": "オフライン",
  "DIY資材購入": "オフライン",
  "有孔ボード設置・Gear Shed作成": "オフライン",
  "照明交換工事": "オフライン",
  "塗装作業": "オフライン",
  "ギアディスプレイ配置": "オフライン",
  "キッチン・備品設置": "オフライン",
  "スマートロック設置・テスト": "オフライン",
  "Wi-Fi開通・速度確認": "オフライン",
  "タブレット設定": "オフライン",  // 現場でタブレットを物理設定
  "2階寝室エアコン設置交渉": "オンライン",  // 電話・メールで対応可
  "ハウスルール作成（日/英）（遠隔可）": "オンライン",
  "ギアレンタル規約作成（遠隔可）": "オンライン",
  "周辺情報ガイド作成（遠隔可）": "オンライン",
  "清掃オペレーション確立": "オフライン",
  "テスト宿泊（関係者）": "オフライン",
  "OTA掲載文作成（遠隔可）": "オンライン",
  "写真撮影（現場作業）": "オフライン",
  "Airbnb登録・料金設定（遠隔可）": "オンライン",
  "Airbnb公開・予約受付開始": "オンライン",
  "GW期間の集客（モニター価格）": "オンライン",
  "正規料金設定・本格運営": "オンライン",
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log('Fetching all tasks from new DB...');
  const pages = [];
  let cursor;
  do {
    const res = await notion.dataSources.query({
      data_source_id: DB_ID,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  
  console.log(`Found ${pages.length} pages`);
  
  let updated = 0, skipped = 0, noMatch = 0;
  
  for (const page of pages) {
    const titleProp = page.properties['タスク名'];
    if (!titleProp || titleProp.type !== 'title') continue;
    const title = titleProp.title.map(t => t.plain_text).join('');
    
    // フェーズタスク（子タスクのみ対象）はparentIdあり
    const currentWorkStyle = page.properties['オンライン/オフライン']?.select?.name;
    const judgment = classifications[title];
    
    if (!judgment) {
      console.log(`  [NO MATCH] ${title}`);
      noMatch++;
      continue;
    }
    
    if (currentWorkStyle === judgment) {
      console.log(`  [SKIP] ${title} → すでに${judgment}`);
      skipped++;
      continue;
    }
    
    console.log(`  [UPDATE] ${title}: ${currentWorkStyle || '未設定'} → ${judgment}`);
    await notion.pages.update({
      page_id: page.id,
      properties: {
        'オンライン/オフライン': { select: { name: judgment } },
      },
    });
    updated++;
    await delay(350); // Rate limit
  }
  
  console.log(`\n完了: 更新=${updated}, スキップ=${skipped}, マッチなし=${noMatch}`);
})();

// Project data for Basecamp Torisawa portal

export type Role = "owner" | "pm";

export interface Member {
  id: string;
  name: string;
  role: Role;
  roleLabel: string;
  password: string;
  avatar: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: "done" | "in-progress" | "upcoming";
  description: string;
  assignee?: string;
}

export interface Task {
  id: string;
  title: string;
  status: "done" | "in-progress" | "todo" | "blocked";
  priority: "high" | "medium" | "low";
  assignee: string;
  category: string;
  dueDate?: string;
}

export interface RevenueScenario {
  label: string;
  occupancy: string;
  nights: string;
  stayRevenue: string;
  gearRental: string;
  total: string;
  ownerShare: string;
  ryoShare: string;
  vsRent: string;
  highlight?: boolean;
}

export interface SchedulePhase {
  period: string;
  theme: string;
  tasks: { task: string; assignee: string; status: string; note?: string }[];
}

// ─── Members ───

export const members: Member[] = [
  {
    id: "takagi",
    name: "高木",
    role: "owner",
    roleLabel: "オーナー",
    password: "tori2026",
    avatar: "🏠",
  },
  {
    id: "ryo",
    name: "稲福 良祐",
    role: "pm",
    roleLabel: "PM / 運営代行",
    password: "tori2026pm",
    avatar: "☕",
  },
];

// ─── Milestones ───

export const milestones: Milestone[] = [
  {
    id: "m1",
    title: "消防適合通知書 受領",
    date: "2026-03",
    status: "in-progress",
    description: "消防署に連絡済み。通知書到着待ち。到着次第すぐ保健所へ",
    assignee: "ryo",
  },
  {
    id: "m2",
    title: "ギア最終選定・オーナー承認",
    date: "2026-03-10",
    status: "done",
    description: "全アイテムリスト確定。高木さんへ発注依頼送信",
    assignee: "ryo",
  },
  {
    id: "m3",
    title: "ギア発注・購入",
    date: "2026-03 2-3週",
    status: "in-progress",
    description: "Amazon・メルカリ等で購入。中古活用",
    assignee: "ryo",
  },
  {
    id: "m4",
    title: "DIY施工（有孔ボード・照明・塗装）",
    date: "2026-03 2-3週",
    status: "upcoming",
    description: "照明工事は業者手配。電気工事士資格必要",
    assignee: "ryo",
  },
  {
    id: "m5",
    title: "セットアップ（ギア配置・スマートロック・Wi-Fi）",
    date: "2026-03 4週",
    status: "upcoming",
    description: "ギアディスプレイ、キッチン備品、SwitchBot、Wi-Fi開通",
    assignee: "ryo",
  },
  {
    id: "m6",
    title: "保健所へ営業許可申請",
    date: "2026-04 1週",
    status: "upcoming",
    description: "消防適合通知書到着後すぐに申請",
    assignee: "ryo",
  },
  {
    id: "m7",
    title: "ハウスルール・ガイド作成",
    date: "2026-04 1週",
    status: "upcoming",
    description: "日英対応。ゴミ分別・騒音・水抜き・ギアの使い方含む",
    assignee: "ryo",
  },
  {
    id: "m8",
    title: "保健所立入検査",
    date: "2026-04 2週",
    status: "upcoming",
    description: "申請後1-2週で実施。消火器の設置が必要（誘導灯・報知器は設置済み）",
  },
  {
    id: "m9",
    title: "写真撮影・OTA掲載文作成",
    date: "2026-04 2週",
    status: "upcoming",
    description: "ギア配置後に実施。コンセプト訴求",
    assignee: "ryo",
  },
  {
    id: "m10",
    title: "営業許可書 受領 → Airbnb登録",
    date: "2026-04 3-4週",
    status: "upcoming",
    description: "許可取得後、Airbnb登録・カレンダー設定・料金設定",
    assignee: "ryo",
  },
  {
    id: "m11",
    title: "テスト宿泊（関係者）",
    date: "2026-04 3週",
    status: "upcoming",
    description: "シャワー・ベッド・室温・ロック確認。動線チェック",
    assignee: "ryo",
  },
  {
    id: "m12",
    title: "グランドオープン",
    date: "2026-05",
    status: "upcoming",
    description: "正規料金設定。平日¥12,500 / 休前日¥15,500",
  },
];

// ─── Tasks ───

export const tasks: Task[] = [
  // 許認可
  {
    id: "t1",
    title: "消防適合通知書の受領確認",
    status: "in-progress",
    priority: "high",
    assignee: "ryo",
    category: "許認可",
  },
  {
    id: "t2",
    title: "簡易宿所営業許可申請（保健所）",
    status: "todo",
    priority: "high",
    assignee: "ryo",
    category: "許認可",
    dueDate: "2026-04-05",
  },
  {
    id: "t3",
    title: "事業系一般廃棄物処理契約（業者手配）",
    status: "todo",
    priority: "high",
    assignee: "ryo",
    category: "許認可",
    dueDate: "2026-03-31",
  },
  {
    id: "t4",
    title: "宿泊者名簿フォーマット準備",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "許認可",
    dueDate: "2026-04-15",
  },
  // 購入・施工
  {
    id: "t5",
    title: "防炎カーテン選定・発注（保健所検査必須）",
    status: "todo",
    priority: "high",
    assignee: "takagi",
    category: "購入・施工",
    dueDate: "2026-03-22",
  },
  {
    id: "t6",
    title: "消火器 発注・設置（誘導灯・報知器は設置済み）",
    status: "todo",
    priority: "high",
    assignee: "takagi",
    category: "購入・施工",
    dueDate: "2026-03-29",
  },
  {
    id: "t7",
    title: "ギア到着確認・DIY資材購入",
    status: "todo",
    priority: "high",
    assignee: "ryo",
    category: "購入・施工",
  },
  {
    id: "t8",
    title: "有孔ボード設置・Gear Shed作成",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "購入・施工",
  },
  {
    id: "t9",
    title: "照明工事（業者手配）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "購入・施工",
  },
  {
    id: "t10",
    title: "塗装作業",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "購入・施工",
  },
  {
    id: "t11",
    title: "2階寝室エアコン設置交渉（オーナー負担）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "購入・施工",
  },
  // 運営準備
  {
    id: "t12",
    title: "スマートロック設置・テスト（SwitchBot）",
    status: "todo",
    priority: "high",
    assignee: "ryo",
    category: "運営準備",
    dueDate: "2026-03-29",
  },
  {
    id: "t13",
    title: "Wi-Fi開通・速度確認",
    status: "todo",
    priority: "high",
    assignee: "ryo",
    category: "運営準備",
    dueDate: "2026-03-29",
  },
  {
    id: "t14",
    title: "タブレット設定・チェックインフロー構築",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "運営準備",
  },
  {
    id: "t15",
    title: "ハウスルール作成（日/英）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "運営準備",
    dueDate: "2026-04-05",
  },
  {
    id: "t16",
    title: "周辺情報ガイド作成（川遊び・釣り・飲食店マップ）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "運営準備",
  },
  {
    id: "t17",
    title: "ギアレンタル規約作成",
    status: "todo",
    priority: "low",
    assignee: "ryo",
    category: "運営準備",
  },
  {
    id: "t18",
    title: "清掃オペレーション確立（所要時間・チェックリスト）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "運営準備",
  },
  // 集客・掲載
  {
    id: "t19",
    title: "Airbnb掲載文作成（コンセプト訴求・ギアリスト）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "集客・掲載",
    dueDate: "2026-04-12",
  },
  {
    id: "t20",
    title: "写真撮影（リスティング用）",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "集客・掲載",
  },
  {
    id: "t21",
    title: "OTA登録・料金・カレンダー設定",
    status: "todo",
    priority: "medium",
    assignee: "ryo",
    category: "集客・掲載",
  },
];

// ─── Revenue Scenarios ───

export const revenueScenarios: RevenueScenario[] = [
  {
    label: "悲観",
    occupancy: "20%",
    nights: "6泊",
    stayRevenue: "¥90,000",
    gearRental: "¥10,000",
    total: "¥100,000",
    ownerShare: "¥65,000",
    ryoShare: "¥35,000",
    vsRent: "▲¥10,000",
  },
  {
    label: "やや悲観",
    occupancy: "25%",
    nights: "7.5泊",
    stayRevenue: "¥112,500",
    gearRental: "¥15,000",
    total: "¥127,500",
    ownerShare: "¥82,875",
    ryoShare: "¥44,625",
    vsRent: "+¥7,875",
  },
  {
    label: "★ 標準",
    occupancy: "35%",
    nights: "10.5泊",
    stayRevenue: "¥157,500",
    gearRental: "¥25,000",
    total: "¥182,500",
    ownerShare: "¥118,625",
    ryoShare: "¥63,875",
    vsRent: "+¥43,625",
    highlight: true,
  },
  {
    label: "楽観",
    occupancy: "50%",
    nights: "15泊",
    stayRevenue: "¥225,000",
    gearRental: "¥40,000",
    total: "¥265,000",
    ownerShare: "¥172,250",
    ryoShare: "¥92,750",
    vsRent: "+¥97,250",
  },
  {
    label: "繁忙期",
    occupancy: "70%",
    nights: "21泊",
    stayRevenue: "¥336,000",
    gearRental: "¥60,000",
    total: "¥396,000",
    ownerShare: "¥257,400",
    ryoShare: "¥138,600",
    vsRent: "+¥182,400",
  },
];

// ─── Purchase Schedule ───

export const schedulePhases: SchedulePhase[] = [
  {
    period: "〜3/16",
    theme: "ギア確定＆発注（完了）",
    tasks: [
      { task: "ギア最終リスト確定", assignee: "稲福", status: "完了" },
      { task: "オーナーへ発注依頼送信", assignee: "稲福", status: "完了" },
      { task: "防炎カーテン購入・設置", assignee: "高木", status: "完了" },
    ],
  },
  {
    period: "3/17〜3/23",
    theme: "発注＆DIY準備",
    tasks: [
      { task: "中古品リサーチ・発注（チェア・テーブル等）", assignee: "稲福", status: "進行中", note: "メルカリ・ヤフオク活用" },
      { task: "照明工事の業者手配", assignee: "稲福", status: "進行中", note: "電気工事士資格必要" },
      { task: "消火器 発注・設置", assignee: "高木", status: "未着手", note: "★保健所検査必須。誘導灯・報知器は設置済み" },
      { task: "DIY資材購入（有孔ボード・塗料・木材）", assignee: "稲福", status: "未着手" },
    ],
  },
  {
    period: "3/24〜3/30",
    theme: "DIY施工＆搬入",
    tasks: [
      { task: "ギア到着確認", assignee: "稲福/高木", status: "未着手" },
      { task: "有孔ボード設置・Gear Shed作成", assignee: "稲福", status: "未着手" },
      { task: "照明交換工事", assignee: "業者", status: "未着手" },
      { task: "塗装作業（パレットベッド等）", assignee: "稲福", status: "未着手" },
    ],
  },
  {
    period: "3/31〜4/6",
    theme: "セットアップ",
    tasks: [
      { task: "ギアディスプレイ配置", assignee: "稲福", status: "未着手" },
      { task: "キッチン・備品設置", assignee: "稲福", status: "未着手" },
      { task: "スマートロック設置・テスト", assignee: "稲福", status: "未着手" },
      { task: "Wi-Fi開通・速度確認", assignee: "高木/稲福", status: "未着手" },
      { task: "タブレット設定（チェックインフロー）", assignee: "稲福", status: "未着手" },
      { task: "消防適合通知書 受領（目標）", assignee: "消防署", status: "未着手" },
    ],
  },
  {
    period: "4/7〜4/13",
    theme: "許認可＆ルール整備",
    tasks: [
      { task: "保健所へ営業許可申請", assignee: "稲福", status: "未着手", note: "通知書到着後すぐ" },
      { task: "ハウスルール作成（日/英）", assignee: "稲福", status: "未着手" },
      { task: "ギアレンタル規約作成", assignee: "稲福", status: "未着手" },
      { task: "周辺情報ガイド作成", assignee: "稲福", status: "未着手" },
      { task: "OTA掲載文作成", assignee: "稲福", status: "未着手" },
    ],
  },
  {
    period: "4/14〜4/20",
    theme: "検査＆撮影",
    tasks: [
      { task: "保健所立入検査（想定）", assignee: "保健所", status: "未着手" },
      { task: "写真撮影（リスティング用）", assignee: "稲福", status: "未着手" },
      { task: "清掃オペレーション確立", assignee: "稲福", status: "未着手" },
    ],
  },
  {
    period: "4/21〜5月上旬",
    theme: "プレオープン → オープン",
    tasks: [
      { task: "営業許可書 受領（想定）", assignee: "保健所", status: "未着手" },
      { task: "Airbnb登録・公開", assignee: "稲福", status: "未着手" },
      { task: "テスト宿泊（関係者）", assignee: "稲福+知人", status: "未着手" },
      { task: "モニター価格で受付開始", assignee: "稲福", status: "未着手", note: "通常の20%OFF等" },
      { task: "正規料金設定・本格運営開始", assignee: "稲福", status: "未着手", note: "平日12,500/休前日15,500" },
    ],
  },
];

// ─── Documents (Drive links) ───

export interface DriveDocument {
  id: string;
  title: string;
  icon: string;
  description: string;
  driveId?: string;
  category: string;
}

export const driveDocuments: DriveDocument[] = [
  {
    id: "dd1",
    title: "ブランド設計書",
    icon: "🎨",
    description: "コンセプト「泊まれる道具箱」の哲学・ターゲット・空間演出・体験フロー・コピーライティング",
    driveId: "1OHrn4V-j7u8bT4DPqLBRJqNRxmGLw6ZvfI61vz0LWVY",
    category: "コンセプト",
  },
  {
    id: "dd2",
    title: "AIエージェント設計レポート",
    icon: "🤖",
    description: "運営AIの知識基盤・地域情報・ゲスト対話戦略",
    driveId: "1n-Ar_fUObTlPoV3p6_YubNO5U5A5xXufbFRtLAZ7-9E",
    category: "コンセプト",
  },
  {
    id: "dd3",
    title: "ギア選定＆オープン計画 2026",
    icon: "🛠️",
    description: "収益シミュレーション・全アイテムリスト・購入スケジュール・OTA掲載文・ハウスマニュアル",
    driveId: "1GXwBgU4xYcxpMJlEOxaaNjngW60PAFO4bxfLsb8aXzo",
    category: "事業計画",
  },
  {
    id: "dd4",
    title: "収支計画",
    icon: "💰",
    description: "月次収支シミュレーション・季節変動・リスク分析",
    driveId: "1TZKdawP4MboSVXYoDwQJRwaarB5GFu5gmDTkejYxGkI",
    category: "事業計画",
  },
  {
    id: "dd5",
    title: "OTA掲載文",
    icon: "📝",
    description: "Airbnb等のOTA掲載用テキスト",
    driveId: "1iPxdiK4DinUBOSuPQ_Rv6fkM2HNbbsTD",
    category: "集客",
  },
  {
    id: "dd6",
    title: "施設運営業務委託契約書",
    icon: "📄",
    description: "高木オーナーとの運営委託契約",
    driveId: "1Mrh7hsUw0OvczCOxbyjQ2dwaxqpyqHmLUQBFSI-BZl8",
    category: "契約",
  },
];

// ─── Helper functions ───

export function getMemberById(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(0)}億円`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}万円`;
  }
  return `${amount.toLocaleString()}円`;
}

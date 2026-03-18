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

export interface Task {
  id: string;
  title: string;
  status: "done" | "in-progress" | "todo" | "blocked";
  priority: "high" | "medium" | "low";
  assignee: string;
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
  parentId?: string;  // parent task ID (if child)
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

// ─── Tasks (hierarchical) ───

export const defaultTasks: Task[] = [
  // Phase 1: 許認可
  { id: "p1", title: "Phase 1: 許認可", status: "in-progress", priority: "high", assignee: "ryo", startDate: "2026-03-17", dueDate: "2026-04-20" },
  { id: "p1-1", title: "消防適合通知書の受領確認", status: "in-progress", priority: "high", assignee: "ryo", startDate: "2026-03-17", dueDate: "2026-03-31", parentId: "p1" },
  { id: "p1-2", title: "事業系一般廃棄物処理契約", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-03-17", dueDate: "2026-03-31", parentId: "p1" },
  { id: "p1-3", title: "簡易宿所営業許可申請", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p1" },
  { id: "p1-4", title: "宿泊者名簿フォーマット準備", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-15", parentId: "p1" },
  { id: "p1-5", title: "保健所立入検査", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-04-14", dueDate: "2026-04-20", parentId: "p1" },

  // Phase 2: 購入・発注
  { id: "p2", title: "Phase 2: 購入・発注", status: "in-progress", priority: "high", assignee: "ryo", startDate: "2026-03-17", dueDate: "2026-04-06" },
  { id: "p2-1", title: "ギア最終選定・オーナー承認", status: "done", priority: "high", assignee: "ryo", startDate: "2026-03-01", dueDate: "2026-03-10", parentId: "p2" },
  { id: "p2-2", title: "防炎カーテン購入・設置", status: "done", priority: "high", assignee: "takagi", startDate: "2026-03-10", dueDate: "2026-03-16", parentId: "p2" },
  { id: "p2-3", title: "中古品リサーチ・発注", status: "in-progress", priority: "medium", assignee: "ryo", startDate: "2026-03-10", dueDate: "2026-03-23", parentId: "p2" },
  { id: "p2-4", title: "消火器 発注・設置", status: "todo", priority: "high", assignee: "takagi", startDate: "2026-03-17", dueDate: "2026-03-29", parentId: "p2" },
  { id: "p2-5", title: "DIY資材購入", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-17", dueDate: "2026-03-23", parentId: "p2" },

  // Phase 3: DIY施工
  { id: "p3", title: "Phase 3: DIY施工", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-24", dueDate: "2026-04-06" },
  { id: "p3-1", title: "有孔ボード設置・Gear Shed作成", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-24", dueDate: "2026-03-30", parentId: "p3" },
  { id: "p3-2", title: "照明交換工事", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-24", dueDate: "2026-03-30", parentId: "p3" },
  { id: "p3-3", title: "塗装作業", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-24", dueDate: "2026-04-06", parentId: "p3" },

  // Phase 4: セットアップ
  { id: "p4", title: "Phase 4: セットアップ", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-03-31", dueDate: "2026-04-13" },
  { id: "p4-1", title: "ギアディスプレイ配置", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-31", dueDate: "2026-04-06", parentId: "p4" },
  { id: "p4-2", title: "キッチン・備品設置", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-03-31", dueDate: "2026-04-06", parentId: "p4" },
  { id: "p4-3", title: "スマートロック設置・テスト", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-03-31", dueDate: "2026-04-06", parentId: "p4" },
  { id: "p4-4", title: "Wi-Fi開通・速度確認", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-03-31", dueDate: "2026-04-06", parentId: "p4" },
  { id: "p4-5", title: "タブレット設定", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p4" },
  { id: "p4-6", title: "2階寝室エアコン設置交渉", status: "todo", priority: "medium", assignee: "ryo", parentId: "p4" },

  // Phase 5: 運営準備
  { id: "p5", title: "Phase 5: 運営準備", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-20" },
  { id: "p5-1", title: "ハウスルール作成（日/英）", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p5" },
  { id: "p5-2", title: "ギアレンタル規約作成", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p5" },
  { id: "p5-3", title: "周辺情報ガイド作成", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p5" },
  { id: "p5-4", title: "清掃オペレーション確立", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-14", dueDate: "2026-04-20", parentId: "p5" },

  // Phase 6: 集客・掲載
  { id: "p6", title: "Phase 6: 集客・掲載", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-27" },
  { id: "p6-1", title: "OTA掲載文作成", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-07", dueDate: "2026-04-13", parentId: "p6" },
  { id: "p6-2", title: "写真撮影", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-14", dueDate: "2026-04-20", parentId: "p6" },
  { id: "p6-3", title: "Airbnb登録・料金設定", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-21", dueDate: "2026-04-27", parentId: "p6" },

  // Phase 7: オープン
  { id: "p7", title: "Phase 7: オープン", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-04-21", dueDate: "2026-05-10" },
  { id: "p7-1", title: "テスト宿泊", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-04-21", dueDate: "2026-04-27", parentId: "p7" },
  { id: "p7-2", title: "モニター価格で受付開始", status: "todo", priority: "medium", assignee: "ryo", startDate: "2026-04-28", dueDate: "2026-05-04", parentId: "p7" },
  { id: "p7-3", title: "正規料金設定・本格運営開始", status: "todo", priority: "high", assignee: "ryo", startDate: "2026-05-05", dueDate: "2026-05-10", parentId: "p7" },
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

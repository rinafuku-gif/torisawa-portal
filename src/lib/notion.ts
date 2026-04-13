import type { Task } from "./data";
import type { GearItem } from "./gear-types";
import { defaultTasks } from "./data";
import { defaultGearItems } from "./gear-types";

const TASKS_DB = process.env.NOTION_TASKS_DB_ID!.trim();
const GEAR_DB = process.env.NOTION_GEAR_DB_ID!.trim();
const NOTION_API_KEY = process.env.NOTION_API_KEY!.trim();
const NOTION_VERSION = "2022-06-28";

// ─── Status / Priority / Assignee Mappings ───

const gtdToStatus: Record<string, Task["status"]> = {
  "Inbox": "todo",
  "次にやること": "todo",
  "いつかやるかも": "todo",
  "未着手": "todo",
  "進行中": "in-progress",
  "完了": "done",
  // "ブロック" は新DBに存在しないため除外
};
const statusToGtd: Record<Task["status"], string> = {
  "todo": "次にやること",
  "in-progress": "進行中",
  "done": "完了",
};

const priorityToJa: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};
const priorityToEn: Record<string, Task["priority"]> = {
  "高": "high",
  "中": "medium",
  "低": "low",
};

const assigneeToJa: Record<string, string> = {
  ryo: "稲福",
  takagi: "高木",
};
const assigneeToEn: Record<string, string> = {
  "稲福": "ryo",
  "高木": "takagi",
};

const workStyleToEn: Record<string, Task["workStyle"]> = {
  "オンライン": "online",
  "オフライン": "offline",
};
const workStyleToJa: Record<string, string> = {
  online: "オンライン",
  offline: "オフライン",
};

// ─── Helpers ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPlainText(prop: any): string {
  if (!prop || !prop.rich_text) return "";
  return prop.rich_text.map((r: { plain_text: string }) => r.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTitle(prop: any): string {
  if (!prop || !prop.title) return "";
  return prop.title.map((t: { plain_text: string }) => t.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSelect(prop: any): string {
  if (!prop || !prop.select) return "";
  return prop.select.name ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStatus(prop: any): string {
  // Notion "status" type has prop.status.name
  if (!prop || !prop.status) return "";
  return prop.status.name ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNumber(prop: any): number {
  if (!prop || prop.number == null) return 0;
  return prop.number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDateStart(prop: any): string | undefined {
  if (!prop || !prop.date || !prop.date.start) return undefined;
  return prop.date.start;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDateEnd(prop: any): string | undefined {
  if (!prop || !prop.date || !prop.date.end) return undefined;
  return prop.date.end;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUrl(prop: any): string | undefined {
  if (!prop || !prop.url) return undefined;
  return prop.url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRelationId(prop: any): string | undefined {
  if (!prop || !prop.relation || prop.relation.length === 0) return undefined;
  return prop.relation[0].id;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Notion fetch helpers ───

async function notionFetch(path: string, options: RequestInit = {}): Promise<unknown> {
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

async function queryDatabase(
  databaseId: string,
  body: Record<string, unknown> = {}
): Promise<unknown[]> {
  const pages: unknown[] = [];
  let startCursor: string | undefined = undefined;
  do {
    const reqBody: Record<string, unknown> = { page_size: 100, ...body };
    if (startCursor) reqBody.start_cursor = startCursor;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await notionFetch(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })) as any;
    pages.push(...res.results);
    startCursor = res.has_more ? res.next_cursor : undefined;
  } while (startCursor);
  return pages;
}

// ─── TASKS ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notionPageToTask(page: any): Task {
  const props = page.properties;
  const gtdLabel = getStatus(props["GTD"]);
  const workStyleJa = getSelect(props["対応場所"]);
  const startDate = getDateStart(props["行動予定日"]);
  const dueDate = getDateEnd(props["行動予定日"]);
  return {
    id: page.id,
    title: getTitle(props["タスク名"]),
    status: gtdToStatus[gtdLabel] || "todo",
    priority: priorityToEn[getSelect(props["優先度"])] || "medium",
    assignee: assigneeToEn[getSelect(props["担当者"])] || "ryo",
    startDate,
    dueDate,
    parentId: getRelationId(props["親アイテム"]),
    workStyle: workStyleToEn[workStyleJa] || undefined,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const pages = await queryDatabase(TASKS_DB, {
    filter: {
      property: "タグ",
      multi_select: {
        contains: "Basecamp Torisawa",
      },
    },
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });

  const tasks = (pages as unknown[]).map(notionPageToTask);
  // Ensure parent tasks come before their children
  const parents = tasks.filter((t) => !t.parentId);
  const result: Task[] = [];
  for (const p of parents) {
    result.push(p);
    result.push(...tasks.filter((t) => t.parentId === p.id));
  }
  // Add any orphans at the end
  const placed = new Set(result.map((t) => t.id));
  result.push(...tasks.filter((t) => !placed.has(t.id)));
  return result;
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  const properties: Record<string, unknown> = {
    "タスク名": { title: [{ text: { content: task.title } }] },
    "GTD": { status: { name: statusToGtd[task.status] || "次にやること" } },
    "優先度": { select: { name: priorityToJa[task.priority] || "中" } },
    "担当者": { select: { name: assigneeToJa[task.assignee] || "稲福" } },
    "タグ": { multi_select: [{ name: "Basecamp Torisawa" }] },
  };

  // 行動予定日: startとendを1つのdateプロパティで表現
  if (task.startDate || task.dueDate) {
    properties["行動予定日"] = {
      date: {
        start: task.startDate || task.dueDate,
        ...(task.dueDate && task.startDate !== task.dueDate ? { end: task.dueDate } : {}),
      },
    };
  }

  if (task.parentId) {
    properties["親アイテム"] = { relation: [{ id: task.parentId }] };
  }
  if (task.workStyle) {
    properties["対応場所"] = { select: { name: workStyleToJa[task.workStyle] } };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = (await notionFetch("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: TASKS_DB },
      properties,
    }),
  })) as any;

  return notionPageToTask(page);
}

export async function updateNotionTask(pageId: string, updates: Partial<Task>): Promise<void> {
  const properties: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    properties["タスク名"] = { title: [{ text: { content: updates.title } }] };
  }
  if (updates.status !== undefined) {
    properties["GTD"] = { status: { name: statusToGtd[updates.status] || "次にやること" } };
  }
  if (updates.priority !== undefined) {
    properties["優先度"] = { select: { name: priorityToJa[updates.priority] || "中" } };
  }
  if (updates.assignee !== undefined) {
    properties["担当者"] = { select: { name: assigneeToJa[updates.assignee] || "稲福" } };
  }

  // 行動予定日: startDate or dueDateが更新された場合
  if (updates.startDate !== undefined || updates.dueDate !== undefined) {
    const start = updates.startDate;
    const end = updates.dueDate;
    if (!start && !end) {
      properties["行動予定日"] = { date: null };
    } else {
      properties["行動予定日"] = {
        date: {
          start: start || end,
          ...(end && start !== end ? { end } : {}),
        },
      };
    }
  }

  if (updates.parentId !== undefined) {
    properties["親アイテム"] = updates.parentId
      ? { relation: [{ id: updates.parentId }] }
      : { relation: [] };
  }
  if (updates.workStyle !== undefined) {
    properties["対応場所"] = updates.workStyle
      ? { select: { name: workStyleToJa[updates.workStyle] } }
      : { select: null };
  }

  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function deleteNotionTask(pageId: string): Promise<void> {
  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ in_trash: true }),
  });
}

export async function seedTasksIfEmpty(): Promise<Task[]> {
  const existing = await fetchTasks();
  if (existing.length > 0) return existing;

  // Double-check after short delay to prevent concurrent seed
  await delay(500);
  const recheck = await fetchTasks();
  if (recheck.length > 0) return recheck;

  // Separate parents and children
  const parents = defaultTasks.filter((t) => !t.parentId);
  const children = defaultTasks.filter((t) => t.parentId);

  // Map from old local ID -> new Notion page ID
  const idMap = new Map<string, string>();

  // Create parents first
  for (const parent of parents) {
    const { id: _oldId, ...rest } = parent;
    const created = await createTask(rest);
    idMap.set(parent.id, created.id);
    await delay(350);
  }

  // Create children with mapped parentId
  for (const child of children) {
    const { id: _oldId, parentId, ...rest } = child;
    const notionParentId = parentId ? idMap.get(parentId) || parentId : undefined;
    const created = await createTask({ ...rest, parentId: notionParentId });
    idMap.set(child.id, created.id);
    await delay(350);
  }

  return fetchTasks();
}

// ─── GEAR ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notionPageToGear(page: any): GearItem {
  const props = page.properties;
  return {
    id: page.id,
    name: getTitle(props["品目"]),
    category: getSelect(props["カテゴリ"]) || "その他",
    product: getPlainText(props["商品名"]),
    price: getNumber(props["単価"]),
    quantity: getNumber(props["数量"]) || 1,
    status: (getSelect(props["ステータス"]) || "未発注") as GearItem["status"],
    priority: (getSelect(props["優先度"]) || "推奨") as GearItem["priority"],
    note: getPlainText(props["備考"]),
    shopUrl: getUrl(props["購入リンク"]),
  };
}

// Gear category order for consistent display
const gearCategoryOrder = ["家電", "寝具・家具", "キャンプギア", "DIY・内装", "備品", "防災設備"];

export async function fetchGear(): Promise<GearItem[]> {
  const pages = await queryDatabase(GEAR_DB, {
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });

  const items = (pages as unknown[]).map(notionPageToGear);
  // Sort by category order, then by creation order within each category
  items.sort((a, b) => {
    const catA = gearCategoryOrder.indexOf(a.category);
    const catB = gearCategoryOrder.indexOf(b.category);
    if (catA !== catB) return (catA === -1 ? 999 : catA) - (catB === -1 ? 999 : catB);
    return 0; // preserve created_time order within category
  });
  return items;
}

export async function createGearItem(item: Omit<GearItem, "id">): Promise<GearItem> {
  const properties: Record<string, unknown> = {
    "品目": { title: [{ text: { content: item.name } }] },
    "カテゴリ": { select: { name: item.category } },
    "商品名": { rich_text: [{ text: { content: item.product || "" } }] },
    "単価": { number: item.price || 0 },
    "数量": { number: item.quantity || 1 },
    "ステータス": { select: { name: item.status || "未発注" } },
    "優先度": { select: { name: item.priority || "推奨" } },
    "備考": { rich_text: [{ text: { content: item.note || "" } }] },
  };

  if (item.shopUrl) {
    properties["購入リンク"] = { url: item.shopUrl };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = (await notionFetch("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: GEAR_DB },
      properties,
    }),
  })) as any;

  return notionPageToGear(page);
}

export async function updateNotionGearItem(pageId: string, updates: Partial<GearItem>): Promise<void> {
  const properties: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    properties["品目"] = { title: [{ text: { content: updates.name } }] };
  }
  if (updates.category !== undefined) {
    properties["カテゴリ"] = { select: { name: updates.category } };
  }
  if (updates.product !== undefined) {
    properties["商品名"] = { rich_text: [{ text: { content: updates.product } }] };
  }
  if (updates.price !== undefined) {
    properties["単価"] = { number: updates.price };
  }
  if (updates.quantity !== undefined) {
    properties["数量"] = { number: updates.quantity };
  }
  if (updates.status !== undefined) {
    properties["ステータス"] = { select: { name: updates.status } };
  }
  if (updates.priority !== undefined) {
    properties["優先度"] = { select: { name: updates.priority } };
  }
  if (updates.note !== undefined) {
    properties["備考"] = { rich_text: [{ text: { content: updates.note } }] };
  }
  if (updates.shopUrl !== undefined) {
    properties["購入リンク"] = updates.shopUrl ? { url: updates.shopUrl } : { url: null };
  }

  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function deleteNotionGearItem(pageId: string): Promise<void> {
  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ in_trash: true }),
  });
}

export async function seedGearIfEmpty(): Promise<GearItem[]> {
  const existing = await fetchGear();
  if (existing.length > 0) return existing;

  // Double-check after short delay to prevent concurrent seed
  await delay(500);
  const recheck = await fetchGear();
  if (recheck.length > 0) return recheck;

  for (const item of defaultGearItems) {
    const { id: _oldId, ...rest } = item;
    await createGearItem(rest);
    await delay(350);
  }

  return fetchGear();
}

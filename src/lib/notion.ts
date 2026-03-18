import { Client } from "@notionhq/client";
import type { Task } from "./data";
import type { GearItem } from "./gear-types";
import { defaultTasks } from "./data";
import { defaultGearItems } from "./gear-types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const TASKS_DB = process.env.NOTION_TASKS_DB_ID!;
const GEAR_DB = process.env.NOTION_GEAR_DB_ID!;

// ─── Status / Priority / Assignee Mappings ───

const statusToJa: Record<string, string> = {
  todo: "未着手",
  "in-progress": "進行中",
  done: "完了",
  blocked: "ブロック",
};
const statusToEn: Record<string, Task["status"]> = {
  "未着手": "todo",
  "進行中": "in-progress",
  "完了": "done",
  "ブロック": "blocked",
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

// ─── Helpers ───

function getPlainText(prop: { rich_text?: Array<{ plain_text: string }> } | undefined): string {
  if (!prop || !("rich_text" in prop) || !prop.rich_text) return "";
  return prop.rich_text.map((r) => r.plain_text).join("");
}

function getTitle(prop: { title?: Array<{ plain_text: string }> } | undefined): string {
  if (!prop || !("title" in prop) || !prop.title) return "";
  return prop.title.map((t) => t.plain_text).join("");
}

function getSelect(prop: { select?: { name: string } | null } | undefined): string {
  if (!prop || !("select" in prop) || !prop.select) return "";
  return prop.select.name;
}

function getNumber(prop: { number?: number | null } | undefined): number {
  if (!prop || !("number" in prop) || prop.number == null) return 0;
  return prop.number;
}

function getDate(prop: { date?: { start?: string | null } | null } | undefined): string | undefined {
  if (!prop || !("date" in prop) || !prop.date || !prop.date.start) return undefined;
  return prop.date.start;
}

function getUrl(prop: { url?: string | null } | undefined): string | undefined {
  if (!prop || !("url" in prop) || !prop.url) return undefined;
  return prop.url;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── TASKS ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notionPageToTask(page: any): Task {
  const props = page.properties;
  return {
    id: page.id,
    title: getTitle(props["タスク名"]),
    status: statusToEn[getSelect(props["ステータス"])] || "todo",
    priority: priorityToEn[getSelect(props["優先度"])] || "medium",
    assignee: assigneeToEn[getSelect(props["担当"])] || "ryo",
    startDate: getDate(props["開始日"]),
    dueDate: getDate(props["期限"]),
    parentId: getPlainText(props["親タスクID"]) || undefined,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const pages = [];
  let cursor: string | undefined = undefined;
  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await notion.dataSources.query({
      data_source_id: TASKS_DB,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages.map(notionPageToTask);
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  const properties: Record<string, unknown> = {
    "タスク名": { title: [{ text: { content: task.title } }] },
    "ステータス": { select: { name: statusToJa[task.status] || "未着手" } },
    "優先度": { select: { name: priorityToJa[task.priority] || "中" } },
    "担当": { select: { name: assigneeToJa[task.assignee] || "稲福" } },
  };

  if (task.startDate) {
    properties["開始日"] = { date: { start: task.startDate } };
  }
  if (task.dueDate) {
    properties["期限"] = { date: { start: task.dueDate } };
  }
  if (task.parentId) {
    properties["親タスクID"] = { rich_text: [{ text: { content: task.parentId } }] };
  }

  const page = await notion.pages.create({
    parent: { data_source_id: TASKS_DB },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

  return notionPageToTask(page);
}

export async function updateNotionTask(pageId: string, updates: Partial<Task>): Promise<void> {
  const properties: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    properties["タスク名"] = { title: [{ text: { content: updates.title } }] };
  }
  if (updates.status !== undefined) {
    properties["ステータス"] = { select: { name: statusToJa[updates.status] || "未着手" } };
  }
  if (updates.priority !== undefined) {
    properties["優先度"] = { select: { name: priorityToJa[updates.priority] || "中" } };
  }
  if (updates.assignee !== undefined) {
    properties["担当"] = { select: { name: assigneeToJa[updates.assignee] || "稲福" } };
  }
  if (updates.startDate !== undefined) {
    properties["開始日"] = updates.startDate ? { date: { start: updates.startDate } } : { date: null };
  }
  if (updates.dueDate !== undefined) {
    properties["期限"] = updates.dueDate ? { date: { start: updates.dueDate } } : { date: null };
  }
  if (updates.parentId !== undefined) {
    properties["親タスクID"] = updates.parentId
      ? { rich_text: [{ text: { content: updates.parentId } }] }
      : { rich_text: [] };
  }

  await notion.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
  });
}

export async function deleteNotionTask(pageId: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    in_trash: true,
  });
}

export async function seedTasksIfEmpty(): Promise<Task[]> {
  const existing = await fetchTasks();
  if (existing.length > 0) return existing;

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

export async function fetchGear(): Promise<GearItem[]> {
  const pages = [];
  let cursor: string | undefined = undefined;
  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await notion.dataSources.query({
      data_source_id: GEAR_DB,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages.map(notionPageToGear);
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

  const page = await notion.pages.create({
    parent: { data_source_id: GEAR_DB },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

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

  await notion.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
  });
}

export async function deleteNotionGearItem(pageId: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    in_trash: true,
  });
}

export async function seedGearIfEmpty(): Promise<GearItem[]> {
  const existing = await fetchGear();
  if (existing.length > 0) return existing;

  for (const item of defaultGearItems) {
    const { id: _oldId, comments: _comments, ...rest } = item;
    await createGearItem(rest);
    await delay(350);
  }

  return fetchGear();
}

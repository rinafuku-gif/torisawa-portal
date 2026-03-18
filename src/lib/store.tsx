"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { defaultTasks, type Task } from "./data";

interface StoreState {
  tasks: Task[];
}

interface StoreActions {
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getChildTasks: (parentId: string) => Task[];
  getParentTasks: () => Task[];
  resetData: () => void;
}

type Store = StoreState & StoreActions;

const STORAGE_KEY = "torisawa-portal-data-v3";
const DATA_VERSION_KEY = "torisawa-data-version";
const CURRENT_DATA_VERSION = 3;

function loadFromStorage(): Task[] | null {
  if (typeof window === "undefined") return null;
  try {
    const storedVersion = Number(localStorage.getItem(DATA_VERSION_KEY) || "0");
    if (storedVersion < CURRENT_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.tasks && Array.isArray(parsed.tasks)) return parsed.tasks;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
}

/** Derive parent status from children */
function deriveParentStatus(children: Task[]): Task["status"] {
  if (children.length === 0) return "todo";
  if (children.every((c) => c.status === "done")) return "done";
  if (children.some((c) => c.status === "blocked")) return "in-progress";
  if (children.some((c) => c.status === "in-progress" || c.status === "done")) return "in-progress";
  return "todo";
}

/** Recalculate all parent statuses AND date ranges based on their children */
function recalcParents(tasks: Task[]): Task[] {
  const parentIds = new Set(tasks.filter((t) => !t.parentId).map((t) => t.id));
  return tasks.map((t) => {
    if (!parentIds.has(t.id)) return t;
    const children = tasks.filter((c) => c.parentId === t.id);
    if (children.length === 0) return t;
    const derivedStatus = deriveParentStatus(children);
    const childStarts = children.map((c) => c.startDate).filter(Boolean) as string[];
    const childEnds = children.map((c) => c.dueDate).filter(Boolean) as string[];
    const derivedStart = childStarts.length > 0 ? childStarts.sort()[0] : t.startDate;
    const derivedEnd = childEnds.length > 0 ? childEnds.sort().reverse()[0] : t.dueDate;
    if (derivedStatus === t.status && derivedStart === t.startDate && derivedEnd === t.dueDate) return t;
    return { ...t, status: derivedStatus, startDate: derivedStart, dueDate: derivedEnd };
  });
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Initialize from localStorage synchronously to avoid flash of default data
    if (typeof window === "undefined") return defaultTasks;
    const stored = loadFromStorage();
    return stored ? recalcParents(stored) : recalcParents([...defaultTasks]);
  });
  const initialized = useRef(false);

  // Auto-save to localStorage whenever tasks change (after initial load)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    saveToStorage(tasks);
  }, [tasks]);

  const addTask = useCallback(
    (task: Omit<Task, "id">) => {
      const id = `t_${Date.now()}`;
      setTasks((prev) => recalcParents([...prev, { ...task, id }]));
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        recalcParents(prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
      );
    },
    []
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const childIds = new Set(prev.filter((t) => t.parentId === id).map((t) => t.id));
        return recalcParents(prev.filter((t) => t.id !== id && !childIds.has(t.id)));
      });
    },
    []
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target || !target.parentId) return prev;
        const nextStatus: Task["status"] =
          target.status === "done"
            ? "todo"
            : target.status === "todo"
            ? "in-progress"
            : target.status === "in-progress"
            ? "done"
            : "todo";
        return recalcParents(
          prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
        );
      });
    },
    []
  );

  const getChildTasks = useCallback(
    (parentId: string) => tasks.filter((t) => t.parentId === parentId),
    [tasks]
  );

  const getParentTasks = useCallback(
    () => tasks.filter((t) => !t.parentId),
    [tasks]
  );

  const resetData = useCallback(() => {
    setTasks(recalcParents([...defaultTasks]));
  }, []);

  const store: Store = useMemo(
    () => ({
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      getChildTasks,
      getParentTasks,
      resetData,
    }),
    [tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getChildTasks, getParentTasks, resetData]
  );

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

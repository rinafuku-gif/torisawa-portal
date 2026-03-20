"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { type Task } from "./data";
import { useAuth } from "./auth";

interface StoreState {
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
}

interface StoreActions {
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getChildTasks: (parentId: string) => Task[];
  getParentTasks: () => Task[];
  refreshTasks: () => void;
  resetData: () => void;
}

type Store = StoreState & StoreActions;

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const fetchFromAPI = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await fetch("/api/tasks?seed=true");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "タスクの取得に失敗しました");
      }
      const data: Task[] = await res.json();
      setTasks(recalcParents(data));
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      setTasksError(e instanceof Error ? e.message : "タスクの取得に失敗しました");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Fetch tasks when user logs in
  useEffect(() => {
    if (user) {
      fetchFromAPI();
    } else {
      setTasks([]);
      setTasksLoading(false);
    }
  }, [user, fetchFromAPI]);

  const refreshTasks = useCallback(() => {
    fetchFromAPI();
  }, [fetchFromAPI]);

  const addTask = useCallback(
    async (task: Omit<Task, "id">) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
        if (!res.ok) throw new Error("作成に失敗");
        const created: Task = await res.json();
        setTasks((prev) => recalcParents([...prev, created]));
      } catch (e) {
        console.error("Failed to add task:", e);
        setTasksError("タスクの追加に失敗しました");
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      // Optimistic update
      setTasks((prev) =>
        recalcParents(prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
      );
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("更新に失敗");
      } catch (e) {
        console.error("Failed to update task:", e);
        setTasksError("タスクの更新に失敗しました。再読み込みしてください");
        // Revert by refreshing
        fetchFromAPI();
      }
    },
    [fetchFromAPI]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      // Optimistic delete (including children)
      setTasks((prev) => {
        const childIds = new Set(prev.filter((t) => t.parentId === id).map((t) => t.id));
        return recalcParents(prev.filter((t) => t.id !== id && !childIds.has(t.id)));
      });
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("削除に失敗");
      } catch (e) {
        console.error("Failed to delete task:", e);
        setTasksError("タスクの削除に失敗しました。再読み込みしてください");
        fetchFromAPI();
      }
    },
    [fetchFromAPI]
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

        // Optimistic update + rollback on failure
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }).catch((e) => {
          console.error("Failed to toggle task:", e);
          setTasksError("タスクの更新に失敗しました。再読み込みしてください");
          fetchFromAPI();
        });

        return recalcParents(
          prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
        );
      });
    },
    [fetchFromAPI]
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
    refreshTasks();
  }, [refreshTasks]);

  const store: Store = useMemo(
    () => ({
      tasks,
      tasksLoading,
      tasksError,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      getChildTasks,
      getParentTasks,
      refreshTasks,
      resetData,
    }),
    [tasks, tasksLoading, tasksError, addTask, updateTask, deleteTask, toggleTaskStatus, getChildTasks, getParentTasks, refreshTasks, resetData]
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

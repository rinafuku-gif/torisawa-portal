"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  milestones as defaultMilestones,
  tasks as defaultTasks,
  type Milestone,
  type Task,
} from "./data";

interface StoreState {
  milestones: Milestone[];
  tasks: Task[];
}

interface StoreActions {
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  resetData: () => void;
}

type Store = StoreState & StoreActions;

const STORAGE_KEY = "torisawa-portal-data";

interface LocalState {
  milestones: Milestone[];
  tasks: Task[];
}

function loadFromStorage(): LocalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(state: LocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setMilestones(stored.milestones);
      setTasks(stored.tasks);
    }
  }, []);

  const persist = useCallback((ms: Milestone[], ts: Task[]) => {
    saveToStorage({ milestones: ms, tasks: ts });
  }, []);

  const addTask = useCallback(
    (task: Omit<Task, "id">) => {
      const id = `t_${Date.now()}`;
      setTasks((prev) => {
        const next = [...prev, { ...task, id }];
        persist(milestones, next);
        return next;
      });
    },
    [milestones, persist]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        persist(milestones, next);
        return next;
      });
    },
    [milestones, persist]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persist(milestones, next);
        return next;
      });
    },
    [milestones, persist]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id !== id) return t;
          const nextStatus: Task["status"] =
            t.status === "done"
              ? "todo"
              : t.status === "todo"
              ? "in-progress"
              : t.status === "in-progress"
              ? "done"
              : "todo";
          return { ...t, status: nextStatus };
        });
        persist(milestones, next);
        return next;
      });
    },
    [milestones, persist]
  );

  const updateMilestone = useCallback(
    (id: string, updates: Partial<Milestone>) => {
      setMilestones((prev) => {
        const next = prev.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        );
        persist(next, tasks);
        return next;
      });
    },
    [tasks, persist]
  );

  const resetData = useCallback(() => {
    setMilestones(defaultMilestones);
    setTasks(defaultTasks);
    persist(defaultMilestones, defaultTasks);
  }, [persist]);

  const store: Store = {
    milestones,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateMilestone,
    resetData,
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

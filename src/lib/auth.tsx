"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { members, type Member } from "./data";

interface AuthContextType {
  user: Member | null;
  loading: boolean;
  login: (memberId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.userId) {
          const found = members.find((m) => m.id === data.userId);
          if (found) setUser(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(memberId: string, password: string): Promise<boolean> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const found = members.find((m) => m.id === data.userId);
      if (found) {
        setUser(found);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function logout() {
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

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
  login: (memberId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("torisawa-portal-user");
    if (stored) {
      const found = members.find((m) => m.id === stored);
      if (found) setUser(found);
    }
  }, []);

  function login(memberId: string, password: string): boolean {
    const member = members.find(
      (m) => m.id === memberId && m.password === password
    );
    if (member) {
      setUser(member);
      localStorage.setItem("torisawa-portal-user", member.id);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("torisawa-portal-user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

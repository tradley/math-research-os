"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { authApi, type User } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mathos_token") : null;
    if (stored) {
      setToken(stored);
      authApi.me(stored)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("mathos_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("mathos_token", res.access_token);
    setToken(res.access_token);
    const me = await authApi.me(res.access_token);
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await authApi.register(email, password, displayName);
    localStorage.setItem("mathos_token", res.access_token);
    setToken(res.access_token);
    const me = await authApi.me(res.access_token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mathos_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

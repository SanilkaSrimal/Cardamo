"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearAuth,
  getToken,
  getUser,
  isAdmin,
  isAuthenticated,
  setToken,
  setUser,
  User,
} from "@/lib/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUserState(null);
      setLoading(false);
      return;
    }
    try {
      const fresh = await api.auth.me();
      setUser(fresh);
      setUserState(fresh);
    } catch {
      clearAuth();
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hydrate from localStorage first for instant render
    const cached = getUser();
    if (cached) setUserState(cached);
    refreshUser();

    // Re-sync React state whenever localStorage user is updated (e.g. after AI credit deduction)
    const onAuthChange = () => {
      const updated = getUser();
      if (updated) setUserState(updated);
    };
    window.addEventListener("cardamo:auth-change", onAuthChange);
    return () => window.removeEventListener("cardamo:auth-change", onAuthChange);
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setToken(res.access_token);
    setUser(res.user);
    setUserState(res.user);
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    setToken(res.access_token);
    setUser(res.user);
    setUserState(res.user);
    router.push("/dashboard");
  };

  const logout = () => {
    clearAuth();
    setUserState(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

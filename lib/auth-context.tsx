"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "./api";
import type { CarrierUser } from "./types";

interface AuthContextValue {
  broker: CarrierUser | null;
  /** True until the initial "is there a token, and is it still valid" check finishes. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Used after a successful accept-invite, which already returns a token — no separate login call needed. */
  setSession: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [broker, setBroker] = useState<CarrierUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .me()
      .then(setBroker)
      .catch(() => {
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setSession = useCallback(async (token: string) => {
    setToken(token);
    const me = await api.me();
    setBroker(me);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await api.login(email, password);
      await setSession(access_token);
    },
    [setSession]
  );

  const logout = useCallback(() => {
    setToken(null);
    setBroker(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ broker, isLoading, login, setSession, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

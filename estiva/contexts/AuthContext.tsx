"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";
import type { AuthUser, LoginRequest } from "@/types/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "estiva-token";

function buildUserFromToken(
  token: string,
  name?: string,
  surname?: string,
): AuthUser | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const roles = Array.isArray(payload.role)
    ? payload.role
    : payload.role
      ? [payload.role]
      : [];

  return {
    id: payload.sub,
    tenantId: payload.tenantId,
    name: name ?? payload.unique_name ?? "",
    surname: surname ?? "",
    email: payload.email,
    roles,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from cookie on mount
  useEffect(() => {
    const token = Cookies.get(TOKEN_KEY);
    if (token && !isTokenExpired(token)) {
      const stored = localStorage.getItem("estiva-user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(buildUserFromToken(token));
        }
      } else {
        setUser(buildUserFromToken(token));
      }
    } else if (token) {
      // Token expired — clean up
      Cookies.remove(TOKEN_KEY);
      localStorage.removeItem("estiva-user");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await authService.login(data);
      const body = res.data;

      if (!body.success || !body.data) {
        throw new Error(body.error?.message ?? "Giriş başarısız");
      }

      const { token, name, surname, email, roles } = body.data;

      // Store token in cookie (expires with JWT — 30 days)
      Cookies.set(TOKEN_KEY, token, {
        expires: 30,
        sameSite: "strict",
        secure: window.location.protocol === "https:",
      });

      const authUser: AuthUser = {
        id: decodeJwt(token)?.sub ?? "",
        tenantId: decodeJwt(token)?.tenantId ?? "",
        name,
        surname,
        email,
        roles,
      };

      // Persist user info for page reload
      localStorage.setItem("estiva-user", JSON.stringify(authUser));
      setUser(authUser);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem("estiva-user");
    setUser(null);
    router.push("/login");
    toast.success("Çıkış yapıldı");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

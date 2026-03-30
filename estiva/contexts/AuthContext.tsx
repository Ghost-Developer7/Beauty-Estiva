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
import { profileService } from "@/services/profileService";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";
import type { AuthUser, LoginRequest } from "@/types/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
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

  // Sync roles from server so that role changes made by an Owner
  // are reflected on the staff member's side without re-login
  useEffect(() => {
    if (!user) return;
    const token = Cookies.get(TOKEN_KEY);
    if (!token || isTokenExpired(token)) return;

    let cancelled = false;
    profileService
      .getProfile()
      .then((res) => {
        if (cancelled || !res.data.success || !res.data.data) return;
        const serverRoles = res.data.data.roles ?? [];
        // Update roles (and name/surname) if they differ from local state
        const rolesChanged =
          serverRoles.length !== user.roles.length ||
          serverRoles.some((r) => !user.roles.includes(r));
        const nameChanged =
          res.data.data.name !== user.name ||
          res.data.data.surname !== user.surname;
        const pictureChanged =
          (res.data.data.profilePicturePath ?? null) !== (user.profilePicturePath ?? null);
        if (rolesChanged || nameChanged || pictureChanged) {
          const updates: Partial<AuthUser> = {};
          if (rolesChanged) updates.roles = serverRoles;
          if (nameChanged) {
            updates.name = res.data.data.name;
            updates.surname = res.data.data.surname;
          }
          if (pictureChanged) {
            updates.profilePicturePath = res.data.data.profilePicturePath ?? null;
          }
          updateUser(updates);
        }
      })
      .catch(() => {
        // Silently ignore — network errors shouldn't break the app
      });

    return () => {
      cancelled = true;
    };
    // Only run once on mount when user is available, not on every user change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("estiva-user", JSON.stringify(updated));
      return updated;
    });
  }, []);

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
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser],
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

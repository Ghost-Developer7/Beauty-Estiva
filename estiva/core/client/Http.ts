/**
 * @module Http
 * Singleton Axios HTTP client for all frontend API calls.
 *
 * Responsibilities:
 *  - Attaches the JWT access token from cookies on every request
 *  - Redirects to /login on 401 responses (session expired)
 *  - Extracts the error message from the API envelope for consistent toasts
 *  - Prevents prototype-pollution via safe JSON serialisation
 *
 * Usage:
 *   import { Http } from "@/core/client";
 *   const data = await Http.get<User>("/staff/42");
 *   await Http.post("/staff", { name: "Alice" });
 */

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely parse a cookie string for a given key. */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

/** Safe JSON serialise → parse to strip prototype chains. */
function safeSerialise(data: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

// ─── Http class ───────────────────────────────────────────────────────────────

export class Http {
  private static _instance: AxiosInstance | null = null;

  /** Lazily initialised Axios instance — shared across the application. */
  static get client(): AxiosInstance {
    if (!Http._instance) {
      Http._instance = Http._create();
    }
    return Http._instance;
  }

  // ── Convenience wrappers ─────────────────────────────────────────────────────

  static get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ) {
    return Http.client.get<T>(url, config);
  }

  static post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return Http.client.post<T>(url, safeSerialise(data), config);
  }

  static put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return Http.client.put<T>(url, safeSerialise(data), config);
  }

  static patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return Http.client.patch<T>(url, safeSerialise(data), config);
  }

  static delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ) {
    return Http.client.delete<T>(url, config);
  }

  // ── Private factory ──────────────────────────────────────────────────────────

  private static _create(): AxiosInstance {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
      headers: { "Content-Type": "application/json" },
      timeout: 30_000,
    });

    // ── Request interceptor: attach access token ─────────────────────────────
    instance.interceptors.request.use((config) => {
      const token = getCookie("estiva-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // ── Response interceptor: normalise errors ───────────────────────────────
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status: number = error.response?.status;

        // Session expired — redirect to login
        if (status === 401 && typeof window !== "undefined") {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Extract the API envelope error message for the caller
        const apiMessage: string | undefined =
          error.response?.data?.error?.message ??
          error.response?.data?.message;

        if (apiMessage) {
          error.message = apiMessage;
        }

        return Promise.reject(error);
      },
    );

    return instance;
  }
}

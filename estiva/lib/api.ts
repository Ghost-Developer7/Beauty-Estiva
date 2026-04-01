import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor — attach JWT token + sanitize
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("estiva-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData: remove Content-Type so axios auto-sets it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data && typeof config.data === "object") {
      // Strip any potential prototype pollution keys from request data
      config.data = JSON.parse(JSON.stringify(config.data));
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401, sanitize error details
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("estiva-token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Prevent leaking server internals in error messages
    if (error.response?.data) {
      const data = error.response.data;
      // Only pass through structured API errors, not raw stack traces
      if (data.error?.message) {
        error.message = data.error.message;
      } else if (typeof data === "string" && data.length > 200) {
        error.message = "Sunucu hatası oluştu";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

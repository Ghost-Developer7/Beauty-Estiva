import api from "@/lib/api";
import type { ApiResponse, ExchangeRate } from "@/types/api";

export const exchangeRateService = {
  /** Returns all exchange rates from the central bank (TCMB) */
  getAll() {
    return api.get<ApiResponse<ExchangeRate[]>>("/exchangerate");
  },

  /** Returns the current rate for a specific currency code */
  getRate(code: string) {
    return api.get<ApiResponse<number>>(`/exchangerate/${code}`);
  },

  /** Force-refreshes rates from the central bank (Owner/Admin only) */
  refresh() {
    return api.post<ApiResponse<ExchangeRate[]>>("/exchangerate/refresh");
  },
};

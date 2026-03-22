import api from "@/lib/api";
import type { ApiResponse, ExchangeRate } from "@/types/api";

export const exchangeRateService = {
  /** Tüm TCMB kurlarını getirir */
  getAll() {
    return api.get<ApiResponse<ExchangeRate[]>>("/exchangerate");
  },

  /** Belirli bir döviz kodu için kuru getirir */
  getRate(code: string) {
    return api.get<ApiResponse<number>>(`/exchangerate/${code}`);
  },

  /** TCMB'den kurları zorla yeniler (Owner/Admin) */
  refresh() {
    return api.post<ApiResponse<ExchangeRate[]>>("/exchangerate/refresh");
  },
};

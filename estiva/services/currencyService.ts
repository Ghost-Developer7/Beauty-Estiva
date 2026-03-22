import api from "@/lib/api";
import type { ApiResponse, CurrencyItem } from "@/types/api";

export const currencyService = {
  list() {
    return api.get<ApiResponse<CurrencyItem[]>>("/currency");
  },
};

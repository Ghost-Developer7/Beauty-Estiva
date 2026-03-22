import api from "@/lib/api";
import type {
  ApiResponse,
  FinancialDashboard,
  RevenueSummary,
  ExpenseSummary,
} from "@/types/api";

export const financialReportService = {
  dashboard(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<FinancialDashboard>>(
      "/financialreport/dashboard",
      { params },
    );
  },

  revenue(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
  }) {
    return api.get<ApiResponse<RevenueSummary>>("/financialreport/revenue", {
      params,
    });
  },

  expense(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<ExpenseSummary>>("/financialreport/expense", {
      params,
    });
  },
};

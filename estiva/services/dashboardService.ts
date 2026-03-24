import api from "@/lib/api";
import type { ApiResponse, DashboardSummary } from "@/types/api";

export const dashboardService = {
  getSummary() {
    return api.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
  },
};

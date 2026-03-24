import api from "@/lib/api";
import type {
  ApiResponse,
  StaffLeaveListItem,
  StaffLeaveCreate,
  StaffLeaveBalance,
} from "@/types/api";

export const staffLeaveService = {
  list(params?: {
    staffId?: number;
    status?: string;
    month?: number;
    year?: number;
  }) {
    return api.get<ApiResponse<StaffLeaveListItem[]>>("/staff/leaves", {
      params,
    });
  },

  create(data: StaffLeaveCreate) {
    return api.post<ApiResponse<{ id: number }>>("/staff/leaves", data);
  },

  approve(id: number) {
    return api.put<ApiResponse<null>>(`/staff/leaves/${id}/approve`);
  },

  reject(id: number) {
    return api.put<ApiResponse<null>>(`/staff/leaves/${id}/reject`);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/staff/leaves/${id}`);
  },

  getBalances() {
    return api.get<ApiResponse<StaffLeaveBalance[]>>(
      "/staff/leaves/balances",
    );
  },
};

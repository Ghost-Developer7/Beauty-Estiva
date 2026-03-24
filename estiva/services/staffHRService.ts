import api from "@/lib/api";
import type {
  ApiResponse,
  StaffHRInfo,
  StaffHRInfoUpdate,
  StaffHRSummary,
} from "@/types/api";

export const staffHRService = {
  getHRInfo(staffId: number) {
    return api.get<ApiResponse<StaffHRInfo>>(`/staff/${staffId}/hr-info`);
  },

  updateHRInfo(staffId: number, data: StaffHRInfoUpdate) {
    return api.put<ApiResponse<null>>(`/staff/${staffId}/hr-info`, data);
  },

  getSummary() {
    return api.get<ApiResponse<StaffHRSummary[]>>("/staff/hr-summary");
  },
};

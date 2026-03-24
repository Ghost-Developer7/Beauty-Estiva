import api from "@/lib/api";
import type {
  ApiResponse,
  StaffShiftItem,
  StaffWeeklyShift,
  StaffShiftBulkUpdate,
} from "@/types/api";

export const staffShiftService = {
  getStaffShifts(staffId: number) {
    return api.get<ApiResponse<StaffShiftItem[]>>(
      `/staff/${staffId}/shifts`,
    );
  },

  updateStaffShifts(staffId: number, data: StaffShiftBulkUpdate) {
    return api.put<ApiResponse<null>>(
      `/staff/${staffId}/shifts`,
      data,
    );
  },

  getWeeklyView() {
    return api.get<ApiResponse<StaffWeeklyShift[]>>(
      "/staff/shifts/weekly-view",
    );
  },
};

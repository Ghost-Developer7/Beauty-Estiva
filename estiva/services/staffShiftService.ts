import api from "@/lib/api";
import type {
  ApiResponse,
  StaffShiftItem,
  StaffWeeklyShift,
  StaffShiftBulkUpdate,
  StaffShiftOverride,
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

  getOverrides(staffId: number, year: number, month: number) {
    return api.get<ApiResponse<StaffShiftOverride[]>>(
      `/staff/${staffId}/shift-overrides`,
      { params: { year, month } },
    );
  },

  upsertOverride(staffId: number, data: {
    date: string;
    startTime: string;
    endTime: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    isWorkingDay: boolean;
  }) {
    return api.put<ApiResponse<null>>(
      `/staff/${staffId}/shift-overrides`,
      data,
    );
  },

  deleteOverride(staffId: number, date: string) {
    return api.delete<ApiResponse<null>>(
      `/staff/${staffId}/shift-overrides`,
      { params: { date } },
    );
  },
};

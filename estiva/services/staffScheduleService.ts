import api from "@/lib/api";
import type {
  ApiResponse,
  StaffUnavailabilityCreate,
  StaffUnavailabilityUpdate,
  StaffUnavailabilityListItem,
  StaffDailySchedule,
} from "@/types/api";

export const staffScheduleService = {
  listUnavailability(
    staffId: number,
    params?: { startDate?: string; endDate?: string },
  ) {
    return api.get<ApiResponse<StaffUnavailabilityListItem[]>>(
      `/staffschedule/unavailability/${staffId}`,
      { params },
    );
  },

  getUnavailabilityDetail(id: number) {
    return api.get<ApiResponse<StaffUnavailabilityListItem>>(
      `/staffschedule/unavailability/detail/${id}`,
    );
  },

  createUnavailability(data: StaffUnavailabilityCreate) {
    return api.post<ApiResponse<number>>(
      "/staffschedule/unavailability",
      data,
    );
  },

  updateUnavailability(id: number, data: StaffUnavailabilityUpdate) {
    return api.put<ApiResponse<null>>(
      `/staffschedule/unavailability/${id}`,
      data,
    );
  },

  deleteUnavailability(id: number) {
    return api.delete<ApiResponse<null>>(
      `/staffschedule/unavailability/${id}`,
    );
  },

  getDailySchedule(staffId: number, date?: string) {
    return api.get<ApiResponse<StaffDailySchedule>>(
      `/staffschedule/daily/${staffId}`,
      { params: date ? { date } : undefined },
    );
  },
};

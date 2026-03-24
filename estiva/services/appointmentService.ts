import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentStatusUpdate,
  AppointmentListItem,
  AppointmentDetail,
  StaffAvailabilityRequest,
  StaffAvailabilityResult,
} from "@/types/api";

export const appointmentService = {
  list(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    customerId?: number;
  }) {
    return api.get<ApiResponse<AppointmentListItem[]>>("/appointment", {
      params,
    });
  },

  listPaginated(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    customerId?: number;
    pageNumber?: number;
    pageSize?: number;
  }) {
    return api.get<ApiResponse<PaginatedResponse<AppointmentListItem>>>("/appointment", {
      params,
    });
  },

  getToday() {
    return api.get<ApiResponse<AppointmentListItem[]>>("/appointment/today");
  },

  getById(id: number) {
    return api.get<ApiResponse<AppointmentDetail>>(`/appointment/${id}`);
  },

  create(data: AppointmentCreate) {
    return api.post<ApiResponse<AppointmentListItem[]>>("/appointment", data);
  },

  update(id: number, data: AppointmentUpdate) {
    return api.put<ApiResponse<AppointmentListItem>>(`/appointment/${id}`, data);
  },

  updateStatus(id: number, data: AppointmentStatusUpdate) {
    return api.patch<ApiResponse<null>>(`/appointment/${id}/status`, data);
  },

  cancel(id: number) {
    return api.delete<ApiResponse<null>>(`/appointment/${id}`);
  },

  checkAvailability(data: StaffAvailabilityRequest) {
    return api.post<ApiResponse<StaffAvailabilityResult>>(
      "/appointment/check-availability",
      data,
    );
  },
};

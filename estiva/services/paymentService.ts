import api from "@/lib/api";
import type {
  ApiResponse,
  AppointmentPaymentCreate,
  AppointmentPaymentUpdate,
  AppointmentPaymentItem,
} from "@/types/api";

export const paymentService = {
  list(params?: { startDate?: string; endDate?: string; staffId?: number; customerId?: number }) {
    return api.get<ApiResponse<AppointmentPaymentItem[]>>(
      "/appointmentpayment",
      { params },
    );
  },

  getByAppointment(appointmentId: number) {
    return api.get<ApiResponse<AppointmentPaymentItem[]>>(
      `/appointmentpayment/appointment/${appointmentId}`,
    );
  },

  getById(id: number) {
    return api.get<ApiResponse<AppointmentPaymentItem>>(
      `/appointmentpayment/${id}`,
    );
  },

  create(data: AppointmentPaymentCreate) {
    return api.post<ApiResponse<number>>("/appointmentpayment", data);
  },

  update(id: number, data: AppointmentPaymentUpdate) {
    return api.put<ApiResponse<null>>(`/appointmentpayment/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/appointmentpayment/${id}`);
  },
};

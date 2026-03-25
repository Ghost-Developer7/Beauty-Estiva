import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  CustomerDebtItem,
  CustomerDebtCreate,
  CustomerDebtUpdate,
  CustomerDebtPaymentItem,
  CreateDebtPayment,
  CustomerDebtSummary,
  CollectionListItem,
} from "@/types/api";

export const debtService = {
  // ─── Debts / Receivables CRUD ───

  list(params?: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    return api.get<ApiResponse<PaginatedResponse<CustomerDebtItem>>>(
      "/customerdebt",
      { params },
    );
  },

  getById(id: number) {
    return api.get<ApiResponse<CustomerDebtItem>>(`/customerdebt/${id}`);
  },

  create(data: CustomerDebtCreate) {
    return api.post<ApiResponse<{ id: number }>>("/customerdebt", data);
  },

  update(id: number, data: CustomerDebtUpdate) {
    return api.put<ApiResponse<null>>(`/customerdebt/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/customerdebt/${id}`);
  },

  // ─── Payments ───

  addPayment(debtId: number, data: CreateDebtPayment) {
    return api.post<ApiResponse<CustomerDebtPaymentItem>>(
      `/customerdebt/${debtId}/payment`,
      data,
    );
  },

  // ─── Summary ───

  getSummary(type?: string) {
    return api.get<ApiResponse<CustomerDebtSummary>>("/customerdebt/summary", {
      params: type ? { type } : undefined,
    });
  },

  // ─── Collections ───

  getCollections(params?: {
    startDate?: string;
    endDate?: string;
    search?: string;
    paymentMethod?: string;
    page?: number;
    pageSize?: number;
  }) {
    return api.get<ApiResponse<PaginatedResponse<CollectionListItem>>>(
      "/customerdebt/collections",
      { params },
    );
  },
};

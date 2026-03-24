import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  CustomerCreate,
  CustomerUpdate,
  CustomerListItem,
  CustomerDetail,
  CustomerHistory,
  CustomerStats,
  UpdateLoyaltyPoints,
  UpdateCustomerTags,
} from "@/types/api";

export const customerService = {
  list(search?: string) {
    return api.get<ApiResponse<CustomerListItem[]>>("/customer", {
      params: search ? { search } : undefined,
    });
  },

  listPaginated(params?: { search?: string; pageNumber?: number; pageSize?: number }) {
    return api.get<ApiResponse<PaginatedResponse<CustomerListItem>>>("/customer", {
      params,
    });
  },

  getById(id: number) {
    return api.get<ApiResponse<CustomerDetail>>(`/customer/${id}`);
  },

  create(data: CustomerCreate) {
    return api.post<ApiResponse<{ id: number }>>("/customer", data);
  },

  update(id: number, data: CustomerUpdate) {
    return api.put<ApiResponse<null>>(`/customer/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/customer/${id}`);
  },

  // ── Loyalty & History ──

  getHistory(id: number) {
    return api.get<ApiResponse<CustomerHistory>>(`/customer/${id}/history`);
  },

  getStats(id: number) {
    return api.get<ApiResponse<CustomerStats>>(`/customer/${id}/stats`);
  },

  updateLoyaltyPoints(id: number, data: UpdateLoyaltyPoints) {
    return api.put<ApiResponse<null>>(`/customer/${id}/loyalty-points`, data);
  },

  updateTags(id: number, data: UpdateCustomerTags) {
    return api.put<ApiResponse<null>>(`/customer/${id}/tags`, data);
  },

  getVipCustomers() {
    return api.get<ApiResponse<CustomerListItem[]>>("/customer/vip");
  },
};

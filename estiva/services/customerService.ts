import api from "@/lib/api";
import type {
  ApiResponse,
  CustomerCreate,
  CustomerUpdate,
  CustomerListItem,
  CustomerDetail,
} from "@/types/api";

export const customerService = {
  list(search?: string) {
    return api.get<ApiResponse<CustomerListItem[]>>("/customer", {
      params: search ? { search } : undefined,
    });
  },

  getById(id: number) {
    return api.get<ApiResponse<CustomerDetail>>(`/customer/${id}`);
  },

  create(data: CustomerCreate) {
    return api.post<ApiResponse<number>>("/customer", data);
  },

  update(id: number, data: CustomerUpdate) {
    return api.put<ApiResponse<null>>(`/customer/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/customer/${id}`);
  },
};

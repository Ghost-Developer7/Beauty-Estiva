import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PackageSaleCreate,
  PackageSaleUpdate,
  PackageSaleListItem,
  PackageSaleStats,
  PackageSaleUsageCreate,
  PackageSalePaymentCreate,
} from "@/types/api";

export const packageSaleService = {
  list(params?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    treatmentId?: number;
    status?: number;
  }) {
    return api.get<ApiResponse<PackageSaleListItem[]>>("/packagesale", { params });
  },

  listPaginated(params?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    treatmentId?: number;
    status?: number;
    pageNumber?: number;
    pageSize?: number;
  }) {
    return api.get<ApiResponse<PaginatedResponse<PackageSaleListItem>>>("/packagesale", { params });
  },

  getById(id: number) {
    return api.get<ApiResponse<PackageSaleListItem>>(`/packagesale/${id}`);
  },

  create(data: PackageSaleCreate) {
    return api.post<ApiResponse<{ id: number }>>("/packagesale", data);
  },

  update(id: number, data: PackageSaleUpdate) {
    return api.put<ApiResponse<boolean>>(`/packagesale/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<boolean>>(`/packagesale/${id}`);
  },

  stats(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<PackageSaleStats>>("/packagesale/stats", { params });
  },

  recordUsage(packageSaleId: number, data: PackageSaleUsageCreate) {
    return api.post<ApiResponse<{ id: number }>>(`/packagesale/${packageSaleId}/usage`, data);
  },

  deleteUsage(usageId: number) {
    return api.delete<ApiResponse<boolean>>(`/packagesale/usage/${usageId}`);
  },

  addPayment(packageSaleId: number, data: PackageSalePaymentCreate) {
    return api.post<ApiResponse<{ id: number }>>(`/packagesale/${packageSaleId}/payment`, data);
  },
};

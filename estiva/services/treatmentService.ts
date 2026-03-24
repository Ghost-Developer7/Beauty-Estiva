import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  TreatmentCreate,
  TreatmentUpdate,
  TreatmentListItem,
} from "@/types/api";

export const treatmentService = {
  list() {
    return api.get<ApiResponse<TreatmentListItem[]>>("/treatment");
  },

  listPaginated(params?: { pageNumber?: number; pageSize?: number }) {
    return api.get<ApiResponse<PaginatedResponse<TreatmentListItem>>>("/treatment", {
      params,
    });
  },

  getById(id: number) {
    return api.get<ApiResponse<TreatmentListItem>>(`/treatment/${id}`);
  },

  create(data: TreatmentCreate) {
    return api.post<ApiResponse<{ id: number }>>("/treatment", data);
  },

  update(id: number, data: TreatmentUpdate) {
    return api.put<ApiResponse<null>>(`/treatment/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/treatment/${id}`);
  },
};

import api from "@/lib/api";
import type {
  ApiResponse,
  BranchListItem,
  BranchDetail,
  BranchCreate,
  BranchUpdate,
  BranchLimit,
} from "@/types/api";

export const branchService = {
  list() {
    return api.get<ApiResponse<BranchListItem[]>>("/branch");
  },

  getById(id: number) {
    return api.get<ApiResponse<BranchDetail>>(`/branch/${id}`);
  },

  create(data: BranchCreate) {
    return api.post<ApiResponse<BranchListItem>>("/branch", data);
  },

  update(id: number, data: BranchUpdate) {
    return api.put<ApiResponse<BranchListItem>>(`/branch/${id}`, data);
  },

  deactivate(id: number) {
    return api.delete<ApiResponse<object>>(`/branch/${id}`);
  },

  assignStaff(branchId: number, staffId: number) {
    return api.post<ApiResponse<object>>(`/branch/${branchId}/assign-staff`, { staffId });
  },

  removeStaff(branchId: number, staffId: number) {
    return api.delete<ApiResponse<object>>(`/branch/${branchId}/remove-staff/${staffId}`);
  },

  getLimit() {
    return api.get<ApiResponse<BranchLimit>>("/branch/limit");
  },
};

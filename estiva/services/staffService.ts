import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface StaffMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  roles: string[];
  isActive: boolean;
  isApproved: boolean;
  defaultCommissionRate: number;
  profilePicturePath: string | null;
  cDate: string | null;
}

export const staffService = {
  list() {
    return api.get<ApiResponse<StaffMember[]>>("/staff");
  },

  listPaginated(params?: { pageNumber?: number; pageSize?: number }) {
    return api.get<ApiResponse<PaginatedResponse<StaffMember>>>("/staff", {
      params,
    });
  },

  getById(id: number) {
    return api.get<ApiResponse<StaffMember>>(`/staff/${id}`);
  },

  changeRole(staffId: number, newRole: string, reason?: string) {
    return api.put<ApiResponse<StaffMember>>(`/staff/${staffId}/role`, {
      role: newRole,
      reason,
    });
  },

  toggleRole(staffId: number, role: string, reason?: string) {
    return api.post<ApiResponse<StaffMember>>(`/staff/${staffId}/role/toggle`, {
      role,
      reason,
    });
  },
};

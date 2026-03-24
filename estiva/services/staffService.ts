import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

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
  cDate: string | null;
}

export const staffService = {
  list() {
    return api.get<ApiResponse<StaffMember[]>>("/staff");
  },

  getById(id: number) {
    return api.get<ApiResponse<StaffMember>>(`/staff/${id}`);
  },

  changeRole(staffId: number, newRole: string, reason?: string) {
    return api.put<ApiResponse<StaffMember>>(`/staff/${staffId}/role`, {
      newRole,
      reason,
    });
  },
};

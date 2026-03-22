import api from "@/lib/api";
import type {
  ApiResponse,
  StaffCommissionRate,
  SetStaffCommissionRequest,
  StaffCommissionRecord,
  StaffCommissionSummary,
} from "@/types/api";

export const commissionService = {
  /** Personelin komisyon oranlarını getirir */
  getStaffRates(staffId: number) {
    return api.get<ApiResponse<StaffCommissionRate>>(
      `/commission/staff/${staffId}/rates`,
    );
  },

  /** Personelin komisyon oranlarını ayarlar */
  setStaffRates(staffId: number, data: SetStaffCommissionRequest) {
    return api.put<ApiResponse<null>>(
      `/commission/staff/${staffId}/rates`,
      data,
    );
  },

  /** Komisyon kayıtlarını listeler */
  getRecords(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
  }) {
    return api.get<ApiResponse<StaffCommissionRecord[]>>(
      "/commission/records",
      { params },
    );
  },

  /** Personel bazlı komisyon özetini getirir */
  getSummary(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<StaffCommissionSummary[]>>(
      "/commission/summary",
      { params },
    );
  },

  /** Personelin kendi komisyon özetini getirir */
  getMySummary(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<StaffCommissionSummary | null>>(
      "/commission/my",
      { params },
    );
  },

  /** Komisyon kayıtlarını "ödendi" olarak işaretler */
  markPaid(commissionRecordIds: number[]) {
    return api.post<ApiResponse<null>>("/commission/mark-paid", {
      commissionRecordIds,
    });
  },
};

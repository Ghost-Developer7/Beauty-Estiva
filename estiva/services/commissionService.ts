import api from "@/lib/api";
import type {
  ApiResponse,
  StaffCommissionRate,
  SetStaffCommissionRequest,
  StaffCommissionRecord,
  StaffCommissionSummary,
  AllCommissionRates,
  BulkPayCommissionsRequest,
} from "@/types/api";

export const commissionService = {
  /** Tüm personel/hizmet komisyon oranlarını getirir */
  getAllRates() {
    return api.get<ApiResponse<AllCommissionRates>>("/commission/rates");
  },

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
    isPaid?: boolean;
  }) {
    return api.get<ApiResponse<StaffCommissionRecord[]>>(
      "/commission/records",
      { params },
    );
  },

  /** Personel bazlı komisyon özetini getirir */
  getSummary(params?: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) {
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

  /** Bireysel personel komisyon geçmişi */
  getStaffSummary(
    staffId: number,
    params?: { startDate?: string; endDate?: string },
  ) {
    return api.get<ApiResponse<StaffCommissionSummary | null>>(
      `/commission/staff/${staffId}/summary`,
      { params },
    );
  },

  /** Tek komisyon kaydını ödendi olarak işaretler */
  payRecord(id: number) {
    return api.post<ApiResponse<null>>(`/commission/records/${id}/pay`);
  },

  /** Komisyon kayıtlarını "ödendi" olarak işaretler (çoklu) */
  markPaid(commissionRecordIds: number[]) {
    return api.post<ApiResponse<null>>("/commission/mark-paid", {
      commissionRecordIds,
    });
  },

  /** Aylık toplu ödeme */
  bulkPay(data: BulkPayCommissionsRequest) {
    return api.post<ApiResponse<null>>("/commission/records/bulk-pay", data);
  },
};

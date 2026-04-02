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
  /** Returns commission rates for all staff / services */
  getAllRates() {
    return api.get<ApiResponse<AllCommissionRates>>("/commission/rates");
  },

  /** Returns commission rates for a specific staff member */
  getStaffRates(staffId: number) {
    return api.get<ApiResponse<StaffCommissionRate>>(
      `/commission/staff/${staffId}/rates`,
    );
  },

  /** Sets commission rates for a specific staff member */
  setStaffRates(staffId: number, data: SetStaffCommissionRequest) {
    return api.put<ApiResponse<null>>(
      `/commission/staff/${staffId}/rates`,
      data,
    );
  },

  /** Lists commission records with optional filters */
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

  /** Returns commission summary grouped by staff */
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

  /** Returns the current staff member's own commission summary */
  getMySummary(params?: { startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<StaffCommissionSummary | null>>(
      "/commission/my",
      { params },
    );
  },

  /** Returns commission summary for a specific staff member */
  getStaffSummary(
    staffId: number,
    params?: { startDate?: string; endDate?: string },
  ) {
    return api.get<ApiResponse<StaffCommissionSummary | null>>(
      `/commission/staff/${staffId}/summary`,
      { params },
    );
  },

  /** Marks a single commission record as paid */
  payRecord(id: number) {
    return api.post<ApiResponse<null>>(`/commission/records/${id}/pay`);
  },

  /** Marks multiple commission records as paid */
  markPaid(commissionRecordIds: number[]) {
    return api.post<ApiResponse<null>>("/commission/mark-paid", {
      commissionRecordIds,
    });
  },

  /** Bulk-pays commissions for a given month */
  bulkPay(data: BulkPayCommissionsRequest) {
    return api.post<ApiResponse<null>>("/commission/records/bulk-pay", data);
  },
};

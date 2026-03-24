import api from "@/lib/api";
import type {
  ApiResponse,
  SubscriptionPlan,
  CurrentSubscription,
  SubscriptionPurchase,
  SubscriptionPurchaseResult,
} from "@/types/api";

export const subscriptionService = {
  listPlans() {
    return api.get<ApiResponse<SubscriptionPlan[]>>("/subscription/plans");
  },

  getCurrent() {
    return api.get<ApiResponse<CurrentSubscription>>("/subscription/current");
  },

  getStatus() {
    return api.get<ApiResponse<{ isActive: boolean; isTrialPeriod: boolean }>>(
      "/subscription/status",
    );
  },

  validateCoupon(code: string, originalPrice: number) {
    return api.post<ApiResponse<{ isValid: boolean; message: string; discountAmount: number | null; isPercentage: boolean }>>(
      "/subscription/validate-coupon",
      { code, originalPrice },
    );
  },

  purchase(data: SubscriptionPurchase) {
    return api.post<ApiResponse<SubscriptionPurchaseResult>>(
      "/subscription/purchase",
      data,
    );
  },

  startTrial() {
    return api.post<ApiResponse<null>>("/subscription/start-trial");
  },

  cancel(data: { reason?: string; requestRefund?: boolean }) {
    return api.post<ApiResponse<null>>("/subscription/cancel", data);
  },

  paymentHistory() {
    return api.get<ApiResponse<unknown[]>>("/subscription/payment-history");
  },

  checkStaffLimit() {
    return api.get<ApiResponse<{
      canAdd: boolean;
      currentCount: number;
      maxCount: number;
      errorMessage: string | null;
    }>>("/subscription/staff-limit");
  },

  // ── Admin endpoints (SuperAdmin only) ──

  adminListPlans() {
    return api.get<ApiResponse<SubscriptionPlan[]>>("/admin/subscription-plans");
  },

  adminGetPlan(id: number) {
    return api.get<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${id}`);
  },

  adminUpdatePlan(id: number, data: Partial<SubscriptionPlan>) {
    return api.put<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${id}`, data);
  },

  adminTogglePlan(id: number) {
    return api.patch<ApiResponse<boolean>>(`/admin/subscription-plans/${id}/toggle`);
  },
};

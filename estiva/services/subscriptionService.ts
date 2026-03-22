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
};

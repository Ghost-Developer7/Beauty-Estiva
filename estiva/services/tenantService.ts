import api from "@/lib/api";
import type {
  ApiResponse,
  TenantOnboardingRequest,
  TenantOnboardingResult,
} from "@/types/api";

export const tenantService = {
  register(data: TenantOnboardingRequest) {
    return api.post<ApiResponse<TenantOnboardingResult>>(
      "/tenantonboarding/register-tenant",
      data,
    );
  },

  generateInviteToken() {
    return api.post<ApiResponse<{ token: string }>>(
      "/tenantonboarding/invite-token",
    );
  },
};

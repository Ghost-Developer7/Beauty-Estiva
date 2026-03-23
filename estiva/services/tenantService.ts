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

  generateInviteToken(email?: string) {
    return api.post<ApiResponse<{ token: string; registerUrl: string; emailSent: boolean }>>(
      "/tenantonboarding/invite-token",
      email ?? null,
      { headers: { "Content-Type": "application/json" } },
    );
  },
};

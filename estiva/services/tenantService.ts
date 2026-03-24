import api from "@/lib/api";
import type {
  ApiResponse,
  TenantOnboardingRequest,
  TenantOnboardingResult,
} from "@/types/api";

export interface TenantInfo {
  companyName: string;
  address: string | null;
  phone: string | null;
}

export interface TenantFullSettings {
  companyName: string;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  reminderHourBefore: number;
  currency: string;
  timezone: string;
  appointmentSlotMinutes: number;
  autoConfirmAppointments: boolean;
  workingHoursJson: string | null;
  holidaysJson: string | null;
}

export interface UpdateTenantProfileRequest {
  companyName?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  currency?: string;
  timezone?: string;
}

export interface WorkingHourDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  lunchBreakStart: string | null;
  lunchBreakEnd: string | null;
}

export interface UpdateWorkingHoursRequest {
  workingHours: WorkingHourDay[];
}

export interface HolidayItem {
  id: string;
  date: string;
  description: string;
  isRecurring: boolean;
}

export interface UpdateHolidaysRequest {
  holidays: HolidayItem[];
}

export interface UpdateAppointmentSettingsRequest {
  appointmentSlotMinutes: number;
  autoConfirmAppointments: boolean;
  bufferMinutes: number;
  reminderHourBefore: number;
}

export interface UpdateNotificationSettingsRequest {
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  reminderHourBefore: number;
}

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

  getTenantInfo() {
    return api.get<ApiResponse<TenantInfo>>("/tenantonboarding/info");
  },

  getFullSettings() {
    return api.get<ApiResponse<TenantFullSettings>>("/tenantsettings");
  },

  updateProfile(data: UpdateTenantProfileRequest) {
    return api.put<ApiResponse<null>>("/tenantsettings/profile", data);
  },

  updateWorkingHours(data: UpdateWorkingHoursRequest) {
    return api.put<ApiResponse<null>>("/tenantsettings/working-hours", {
      workingHoursJson: JSON.stringify(data.workingHours),
    });
  },

  updateHolidays(data: UpdateHolidaysRequest) {
    return api.put<ApiResponse<null>>("/tenantsettings/holidays", {
      holidaysJson: JSON.stringify(data.holidays),
    });
  },

  updateAppointmentSettings(data: UpdateAppointmentSettingsRequest) {
    return api.put<ApiResponse<null>>("/tenantsettings/appointment-settings", data);
  },

  updateNotificationSettings(data: UpdateNotificationSettingsRequest) {
    return api.put<ApiResponse<null>>("/tenantsettings/notification-settings", data);
  },
};

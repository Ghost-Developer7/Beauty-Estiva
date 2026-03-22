import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

// ─── Types ───
export interface TenantSettings {
  companyName: string;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  reminderHourBefore: number;
}

export interface TenantSettingsUpdate {
  phone?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  reminderHourBefore?: number;
}

export interface NotificationRule {
  id: number;
  channel: number;
  channelName: string;
  isActive: boolean;
}

export interface NotificationRuleUpdate {
  channel: number;
  isActive: boolean;
}

export interface WhatsappIntegration {
  whatsappApiToken: string | null;
  whatsappInstanceId: string | null;
}

export interface SendReminderResult {
  sent: boolean;
  message: string | null;
}

// ─── Service ───
export const notificationService = {
  // Tenant settings
  getSettings() {
    return api.get<ApiResponse<TenantSettings>>("/notification/settings");
  },

  updateSettings(data: TenantSettingsUpdate) {
    return api.put<ApiResponse<null>>("/notification/settings", data);
  },

  // Notification rules
  getRules() {
    return api.get<ApiResponse<NotificationRule[]>>("/notification/rules");
  },

  updateRule(data: NotificationRuleUpdate) {
    return api.put<ApiResponse<null>>("/notification/rules", data);
  },

  // WhatsApp integration
  getWhatsapp() {
    return api.get<ApiResponse<WhatsappIntegration | null>>("/notification/whatsapp");
  },

  saveWhatsapp(data: WhatsappIntegration) {
    return api.put<ApiResponse<null>>("/notification/whatsapp", data);
  },

  // Send reminder
  sendReminder(appointmentId: number) {
    return api.post<ApiResponse<SendReminderResult>>(
      "/notification/send-reminder",
      { appointmentId },
    );
  },
};

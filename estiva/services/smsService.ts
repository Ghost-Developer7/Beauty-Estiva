import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

// ─── Types ───

export interface SmsSettings {
  smsProvider: string | null;
  apiKey: string | null;
  apiHash: string | null;
  senderTitle: string | null;
  isActive: boolean;
  creditBalance: number;
  creditBalanceUpdatedAt: string | null;
}

export interface SmsResult {
  success: boolean;
  message: string | null;
  orderId: string | null;
}

export interface SmsCreditResult {
  success: boolean;
  balance: number;
  message: string | null;
}

export interface SendSmsRequest {
  phoneNumber: string;
  message: string;
}

export interface SendBulkSmsRequest {
  phoneNumbers: string[];
  message: string;
}

export interface TestSmsRequest {
  phoneNumber: string;
}

// ─── Service ───

export const smsService = {
  // Settings
  getSettings() {
    return api.get<ApiResponse<SmsSettings>>("/sms/settings");
  },

  saveSettings(data: SmsSettings) {
    return api.put<ApiResponse<null>>("/sms/settings", data);
  },

  // Balance
  getBalance() {
    return api.get<ApiResponse<SmsCreditResult>>("/sms/balance");
  },

  // Send SMS
  sendSms(data: SendSmsRequest) {
    return api.post<ApiResponse<SmsResult>>("/sms/send", data);
  },

  sendBulkSms(data: SendBulkSmsRequest) {
    return api.post<ApiResponse<SmsResult>>("/sms/send-bulk", data);
  },

  // Test SMS
  sendTestSms(data: TestSmsRequest) {
    return api.post<ApiResponse<SmsResult>>("/sms/test", data);
  },

  // Appointment Reminder
  sendAppointmentReminder(appointmentId: number) {
    return api.post<ApiResponse<SmsResult>>(
      `/sms/appointment-reminder/${appointmentId}`,
    );
  },
};

"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { smsService } from "@/services/smsService";
import { appointmentService } from "@/services/appointmentService";
import type { SmsSettings, SmsCreditResult } from "@/services/smsService";
import type { AppointmentListItem } from "@/types/api";
import toast from "react-hot-toast";

// ─── Translations ───
const copy = {
  en: {
    title: "SMS Management",
    subtitle: "Manage your ileti Merkezi SMS integration",
    tabs: {
      settings: "Settings",
      test: "Test SMS",
      send: "Quick Send",
      reminder: "Appointment Reminder",
    },
    // Settings
    settingsTitle: "SMS Settings",
    settingsDesc: "Configure your ileti Merkezi API credentials. You need an ileti Merkezi account to send SMS.",
    provider: "Provider",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your ileti Merkezi API Key",
    apiHash: "API Hash",
    apiHashPlaceholder: "Enter your ileti Merkezi API Hash",
    senderTitle: "Sender Title",
    senderTitlePlaceholder: "Approved sender name (e.g. MYSALON)",
    senderTitleHint: "This must be a pre-approved title in your ileti Merkezi panel.",
    isActive: "SMS Integration Active",
    save: "Save Settings",
    saving: "Saving...",
    saved: "SMS settings saved successfully.",
    saveFailed: "Failed to save settings.",
    // Balance
    balanceTitle: "SMS Credit Balance",
    balance: "Credits",
    refreshBalance: "Refresh",
    refreshing: "Checking...",
    balanceUpdated: "Balance updated.",
    balanceFailed: "Failed to check balance.",
    lastUpdated: "Last updated",
    // Test SMS
    testTitle: "Send Test SMS",
    testDesc: "Send a test message to verify your configuration is working correctly.",
    testPhone: "Phone Number",
    testPhonePlaceholder: "05XX XXX XX XX",
    sendTest: "Send Test SMS",
    sendingTest: "Sending...",
    testSuccess: "Test SMS sent successfully!",
    testFailed: "Test SMS failed.",
    // Quick Send
    sendTitle: "Quick Send SMS",
    sendDesc: "Send a single SMS to any phone number.",
    phone: "Phone Number",
    phonePlaceholder: "05XX XXX XX XX",
    message: "Message",
    messagePlaceholder: "Type your message here...",
    charCount: "characters",
    smsCount: "SMS",
    send: "Send SMS",
    sending: "Sending...",
    sendSuccess: "SMS sent successfully!",
    sendFailed: "Failed to send SMS.",
    // Reminder
    reminderTitle: "Appointment Reminder",
    reminderDesc: "Send SMS reminders to customers for their upcoming appointments.",
    selectAppointment: "Select Appointment",
    noUpcoming: "No upcoming appointments found.",
    sendReminder: "Send Reminder",
    sendingReminder: "Sending...",
    reminderSuccess: "Reminder sent successfully!",
    reminderFailed: "Failed to send reminder.",
    // Common
    loading: "Loading...",
    unauthorized: "You need Owner or Admin role to manage SMS settings.",
    notConfigured: "SMS integration is not configured yet. Please set up your credentials first.",
    legalWarning: "You are responsible for all legal obligations related to SMS transmissions. Commercial SMS requires prior consent (IYS) as per Turkish Electronic Commerce Law.",
    iletimerkezi: "ileti Merkezi",
    setupGuide: "Setup Guide",
    setupStep1: "Create an ileti Merkezi account at iletimerkezi.com",
    setupStep2: "Get your API Key and API Hash from your panel",
    setupStep3: "Register an approved sender title (baslik)",
    setupStep4: "Enter your credentials below and save",
    setupStep5: "Send a test SMS to verify everything works",
  },
  tr: {
    title: "SMS Yonetimi",
    subtitle: "ileti Merkezi SMS entegrasyonunuzu yonetin",
    tabs: {
      settings: "Ayarlar",
      test: "Test SMS",
      send: "Hizli Gonder",
      reminder: "Randevu Hatirlatma",
    },
    // Settings
    settingsTitle: "SMS Ayarlari",
    settingsDesc: "ileti Merkezi API bilgilerinizi yapilandirin. SMS gondermek icin bir ileti Merkezi hesabiniz olmalidir.",
    provider: "Saglayici",
    apiKey: "API Key",
    apiKeyPlaceholder: "ileti Merkezi API Key giriniz",
    apiHash: "API Hash",
    apiHashPlaceholder: "ileti Merkezi API Hash giriniz",
    senderTitle: "Gonderici Basligi",
    senderTitlePlaceholder: "Onayli gonderici adi (orn: SALONUM)",
    senderTitleHint: "Bu, ileti Merkezi panelinizde onaylanmis bir baslik olmalidir.",
    isActive: "SMS Entegrasyonu Aktif",
    save: "Ayarlari Kaydet",
    saving: "Kaydediliyor...",
    saved: "SMS ayarlari basariyla kaydedildi.",
    saveFailed: "Ayarlar kaydedilemedi.",
    // Balance
    balanceTitle: "SMS Kredi Bakiyesi",
    balance: "Kredi",
    refreshBalance: "Yenile",
    refreshing: "Kontrol ediliyor...",
    balanceUpdated: "Bakiye guncellendi.",
    balanceFailed: "Bakiye sorgulanamadi.",
    lastUpdated: "Son guncelleme",
    // Test SMS
    testTitle: "Test SMS Gonder",
    testDesc: "Yapilandirmanizin dogru calistigini dogrulamak icin bir test mesaji gonderin.",
    testPhone: "Telefon Numarasi",
    testPhonePlaceholder: "05XX XXX XX XX",
    sendTest: "Test SMS Gonder",
    sendingTest: "Gonderiliyor...",
    testSuccess: "Test SMS'i basariyla gonderildi!",
    testFailed: "Test SMS'i gonderilemedi.",
    // Quick Send
    sendTitle: "Hizli SMS Gonder",
    sendDesc: "Herhangi bir telefon numarasina tek SMS gonderin.",
    phone: "Telefon Numarasi",
    phonePlaceholder: "05XX XXX XX XX",
    message: "Mesaj",
    messagePlaceholder: "Mesajinizi buraya yazin...",
    charCount: "karakter",
    smsCount: "SMS",
    send: "SMS Gonder",
    sending: "Gonderiliyor...",
    sendSuccess: "SMS basariyla gonderildi!",
    sendFailed: "SMS gonderilemedi.",
    // Reminder
    reminderTitle: "Randevu Hatirlatma",
    reminderDesc: "Yaklasan randevulari icin musterilere SMS hatirlatmasi gonderin.",
    selectAppointment: "Randevu Secin",
    noUpcoming: "Yaklasan randevu bulunamadi.",
    sendReminder: "Hatirlatma Gonder",
    sendingReminder: "Gonderiliyor...",
    reminderSuccess: "Hatirlatma basariyla gonderildi!",
    reminderFailed: "Hatirlatma gonderilemedi.",
    // Common
    loading: "Yukleniyor...",
    unauthorized: "SMS ayarlarini yonetmek icin Owner veya Admin rolune sahip olmalisiniz.",
    notConfigured: "SMS entegrasyonu henuz yapilandirilmadi. Lutfen once kimlik bilgilerinizi ayarlayin.",
    legalWarning: "SMS gonderimlerinin tum yasal ve cezai yukumlulukleri size aittir. Ticari SMS gonderimleri icin onceden onay (IYS) alinmasi, Elektronik Ticaretin Duzenlenmesi Hakkinda Kanun geregi zorunludur.",
    iletimerkezi: "ileti Merkezi",
    setupGuide: "Kurulum Rehberi",
    setupStep1: "iletimerkezi.com adresinden bir ileti Merkezi hesabi olusturun",
    setupStep2: "Panelinizden API Key ve API Hash bilgilerinizi alin",
    setupStep3: "Onayli bir gonderici basligi (baslik) kaydedin",
    setupStep4: "Asagiya kimlik bilgilerinizi girin ve kaydedin",
    setupStep5: "Her seyin calistigini dogrulamak icin test SMS'i gonderin",
  },
};

type TabKey = "settings" | "test" | "send" | "reminder";

export default function EasySmsScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];

  const isAdmin =
    user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const [activeTab, setActiveTab] = useState<TabKey>("settings");
  const [loading, setLoading] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<SmsSettings>({
    smsProvider: "iletimerkezi",
    apiKey: null,
    apiHash: null,
    senderTitle: null,
    isActive: false,
    creditBalance: 0,
    creditBalanceUpdatedAt: null,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Balance state
  const [balance, setBalance] = useState<SmsCreditResult | null>(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  // Test SMS state
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Quick Send state
  const [sendPhone, setSendPhone] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  // Reminder state
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // ─── Load Settings ───
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await smsService.getSettings();
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch {
      // silent — default empty settings
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Load Upcoming Appointments ───
  const loadUpcomingAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const res = await appointmentService.list({
        startDate: today,
        endDate: nextWeek,
      });
      if (res.data.success && res.data.data) {
        const upcoming = res.data.data.filter(
          (a) => a.status === "Scheduled" || a.status === "Confirmed"
        );
        setAppointments(upcoming);
      }
    } catch {
      // silent
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin, loadSettings]);

  useEffect(() => {
    if (activeTab === "reminder" && isAdmin) {
      loadUpcomingAppointments();
    }
  }, [activeTab, isAdmin, loadUpcomingAppointments]);

  // ─── Save Settings ───
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await smsService.saveSettings(settings);
      toast.success(t.saved);
    } catch {
      toast.error(t.saveFailed);
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Refresh Balance ───
  const handleRefreshBalance = async () => {
    try {
      setRefreshingBalance(true);
      const res = await smsService.getBalance();
      if (res.data.success && res.data.data) {
        setBalance(res.data.data);
        toast.success(t.balanceUpdated);
      } else {
        toast.error(t.balanceFailed);
      }
    } catch {
      toast.error(t.balanceFailed);
    } finally {
      setRefreshingBalance(false);
    }
  };

  // ─── Send Test SMS ───
  const handleSendTest = async () => {
    if (!testPhone.trim()) return;
    try {
      setSendingTest(true);
      const res = await smsService.sendTestSms({ phoneNumber: testPhone.trim() });
      if (res.data.success) {
        toast.success(t.testSuccess);
        setTestPhone("");
      } else {
        toast.error(res.data.error?.message || t.testFailed);
      }
    } catch {
      toast.error(t.testFailed);
    } finally {
      setSendingTest(false);
    }
  };

  // ─── Send SMS ───
  const handleSendSms = async () => {
    if (!sendPhone.trim() || !sendMessage.trim()) return;
    try {
      setSendingSms(true);
      const res = await smsService.sendSms({
        phoneNumber: sendPhone.trim(),
        message: sendMessage.trim(),
      });
      if (res.data.success) {
        toast.success(t.sendSuccess);
        setSendPhone("");
        setSendMessage("");
      } else {
        toast.error(res.data.error?.message || t.sendFailed);
      }
    } catch {
      toast.error(t.sendFailed);
    } finally {
      setSendingSms(false);
    }
  };

  // ─── Send Reminder ───
  const handleSendReminder = async () => {
    if (!selectedAppointmentId) return;
    try {
      setSendingReminder(true);
      const res = await smsService.sendAppointmentReminder(selectedAppointmentId);
      if (res.data.success) {
        toast.success(t.reminderSuccess);
        setSelectedAppointmentId(null);
      } else {
        toast.error(res.data.error?.message || t.reminderFailed);
      }
    } catch {
      toast.error(t.reminderFailed);
    } finally {
      setSendingReminder(false);
    }
  };

  // ─── SMS character count helper ───
  const smsCharLimit = 160;
  const messageLength = sendMessage.length;
  const smsPageCount = messageLength === 0 ? 0 : Math.ceil(messageLength / smsCharLimit);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/60 text-sm">
        {t.unauthorized}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/60 text-sm">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-white/50 mt-1">{t.subtitle}</p>
      </div>

      {/* Legal Warning */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-xs md:text-sm text-yellow-200/80 leading-relaxed flex gap-3">
        <span className="text-xl mt-0.5">&#9888;</span>
        <p>{t.legalWarning}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        {(Object.keys(t.tabs) as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs md:text-sm font-medium transition ${
              activeTab === key
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.tabs[key]}
          </button>
        ))}
      </div>

      {/* ═══ Settings Tab ═══ */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Setup Guide */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t.setupGuide}</h2>
            <ol className="space-y-2 text-sm text-white/60 list-decimal list-inside">
              <li>{t.setupStep1}</li>
              <li>{t.setupStep2}</li>
              <li>{t.setupStep3}</li>
              <li>{t.setupStep4}</li>
              <li>{t.setupStep5}</li>
            </ol>
          </div>

          {/* Settings Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">{t.settingsTitle}</h2>
              <p className="text-xs text-white/40 mt-1">{t.settingsDesc}</p>
            </div>

            {/* Provider (read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">{t.provider}</label>
              <input
                type="text"
                value={t.iletimerkezi}
                disabled
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 outline-none"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">{t.apiKey}</label>
              <input
                type="password"
                value={settings.apiKey ?? ""}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder={t.apiKeyPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition"
              />
            </div>

            {/* API Hash */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">{t.apiHash}</label>
              <input
                type="password"
                value={settings.apiHash ?? ""}
                onChange={(e) => setSettings({ ...settings, apiHash: e.target.value })}
                placeholder={t.apiHashPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition"
              />
            </div>

            {/* Sender Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">{t.senderTitle}</label>
              <input
                type="text"
                value={settings.senderTitle ?? ""}
                onChange={(e) => setSettings({ ...settings, senderTitle: e.target.value })}
                placeholder={t.senderTitlePlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition"
              />
              <p className="text-[10px] text-white/30">{t.senderTitleHint}</p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">{t.isActive}</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.isActive ? "bg-green-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition"
            >
              {savingSettings ? t.saving : t.save}
            </button>
          </div>

          {/* Credit Balance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.balanceTitle}</h2>
              <button
                onClick={handleRefreshBalance}
                disabled={refreshingBalance}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 px-3 py-1.5 text-xs font-medium transition"
              >
                {refreshingBalance ? t.refreshing : t.refreshBalance}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">
                {balance?.balance ?? settings.creditBalance ?? 0}
              </span>
              <span className="text-sm text-white/40">{t.balance}</span>
            </div>

            {settings.creditBalanceUpdatedAt && (
              <p className="text-[10px] text-white/30">
                {t.lastUpdated}:{" "}
                {new Date(settings.creditBalanceUpdatedAt).toLocaleString(
                  language === "tr" ? "tr-TR" : "en-US"
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══ Test SMS Tab ═══ */}
      {activeTab === "test" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">{t.testTitle}</h2>
            <p className="text-xs text-white/40 mt-1">{t.testDesc}</p>
          </div>

          {!settings.isActive && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200/80">
              {t.notConfigured}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">{t.testPhone}</label>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder={t.testPhonePlaceholder}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition"
            />
          </div>

          <button
            onClick={handleSendTest}
            disabled={sendingTest || !testPhone.trim() || !settings.isActive}
            className="w-full rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition"
          >
            {sendingTest ? t.sendingTest : t.sendTest}
          </button>
        </div>
      )}

      {/* ═══ Quick Send Tab ═══ */}
      {activeTab === "send" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">{t.sendTitle}</h2>
            <p className="text-xs text-white/40 mt-1">{t.sendDesc}</p>
          </div>

          {!settings.isActive && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200/80">
              {t.notConfigured}
            </div>
          )}

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">{t.phone}</label>
            <input
              type="tel"
              value={sendPhone}
              onChange={(e) => setSendPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">{t.message}</label>
            <textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition resize-none"
            />
            <div className="flex justify-end gap-3 text-[10px] text-white/30">
              <span>
                {messageLength} {t.charCount}
              </span>
              <span>
                {smsPageCount} {t.smsCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleSendSms}
            disabled={
              sendingSms ||
              !sendPhone.trim() ||
              !sendMessage.trim() ||
              !settings.isActive
            }
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition"
          >
            {sendingSms ? t.sending : t.send}
          </button>
        </div>
      )}

      {/* ═══ Appointment Reminder Tab ═══ */}
      {activeTab === "reminder" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">{t.reminderTitle}</h2>
            <p className="text-xs text-white/40 mt-1">{t.reminderDesc}</p>
          </div>

          {!settings.isActive && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200/80">
              {t.notConfigured}
            </div>
          )}

          {loadingAppointments ? (
            <p className="text-sm text-white/40">{t.loading}</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-white/40">{t.noUpcoming}</p>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                {t.selectAppointment}
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {appointments.map((appt) => {
                  const isSelected = selectedAppointmentId === appt.id;
                  const date = new Date(appt.startTime);
                  const dateStr = date.toLocaleDateString(
                    language === "tr" ? "tr-TR" : "en-US",
                    { day: "2-digit", month: "2-digit", year: "numeric" }
                  );
                  const timeStr = date.toLocaleTimeString(
                    language === "tr" ? "tr-TR" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  );

                  return (
                    <button
                      key={appt.id}
                      onClick={() => setSelectedAppointmentId(isSelected ? null : appt.id)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {appt.customerFullName}
                        </span>
                        <span className="text-xs text-white/40">
                          {dateStr} {timeStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/50">
                          {appt.treatmentName}
                        </span>
                        <span className="text-[10px] text-white/30">|</span>
                        <span className="text-xs text-white/50">
                          {appt.staffFullName}
                        </span>
                        {appt.customerPhone && (
                          <>
                            <span className="text-[10px] text-white/30">|</span>
                            <span className="text-xs text-white/30">
                              {appt.customerPhone}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleSendReminder}
            disabled={
              sendingReminder || !selectedAppointmentId || !settings.isActive
            }
            className="w-full rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition"
          >
            {sendingReminder ? t.sendingReminder : t.sendReminder}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { tenantService } from "@/services/tenantService";
import { notificationService } from "@/services/notificationService";
import type { TenantFullSettings, WorkingHourDay, HolidayItem } from "@/services/tenantService";
import type { NotificationRule, WhatsappIntegration } from "@/services/notificationService";
import toast from "react-hot-toast";

// ─── Translations ───
const copy = {
  en: {
    title: "Settings",
    subtitle: "Manage your salon settings",
    tabs: [
      { label: "Salon Profile", icon: "store" },
      { label: "Working Hours", icon: "clock" },
      { label: "Holidays", icon: "calendar" },
      { label: "Appointments", icon: "booking" },
      { label: "Notifications", icon: "bell" },
    ],
    // Profile
    salonName: "Salon Name",
    phone: "Phone",
    address: "Address",
    taxNumber: "Tax Number",
    taxOffice: "Tax Office",
    currency: "Currency",
    timezone: "Timezone",
    save: "Save Changes",
    saving: "Saving...",
    saved: "Settings saved",
    saveFailed: "Save failed",
    // Working Hours
    workingHoursTitle: "Working Hours",
    workingHoursDesc: "Set your salon's opening and closing times for each day of the week.",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    open: "Open",
    closed: "Closed",
    openTime: "Opens",
    closeTime: "Closes",
    lunchStart: "Lunch Start",
    lunchEnd: "Lunch End",
    addLunch: "Add Lunch Break",
    removeLunch: "Remove",
    // Holidays
    holidaysTitle: "Holidays",
    holidaysDesc: "Define holidays when your salon will be closed.",
    date: "Date",
    description: "Description",
    recurring: "Recurring Annually",
    addHoliday: "Add Holiday",
    deleteHoliday: "Delete",
    noHolidays: "No holidays defined.",
    // Appointment
    appointmentTitle: "Appointment Settings",
    appointmentDesc: "Configure how appointments work in your salon.",
    slotDuration: "Slot Duration (minutes)",
    autoConfirm: "Auto-confirm Appointments",
    autoConfirmDesc: "Automatically confirm new appointments without manual approval.",
    bufferTime: "Buffer Time Between Appointments (minutes)",
    reminderHour: "Reminder Hours Before Appointment",
    // Notifications
    notificationTitle: "Notification Settings",
    notificationDesc: "Configure how customers receive notifications.",
    smsEnabled: "SMS Notifications",
    emailEnabled: "Email Notifications",
    whatsappEnabled: "WhatsApp Notifications",
    whatsappTitle: "WhatsApp Integration",
    whatsappDesc: "Configure your WhatsApp Business API credentials.",
    apiToken: "API Token",
    instanceId: "Instance ID",
    loading: "Loading...",
    unauthorized: "You need Owner or Admin role to access settings.",
  },
  tr: {
    title: "Ayarlar",
    subtitle: "Salon ayarlarinizi yonetin",
    tabs: [
      { label: "Salon Profili", icon: "store" },
      { label: "Calisma Saatleri", icon: "clock" },
      { label: "Tatil Gunleri", icon: "calendar" },
      { label: "Randevu Ayarlari", icon: "booking" },
      { label: "Bildirimler", icon: "bell" },
    ],
    // Profile
    salonName: "Salon Adi",
    phone: "Telefon",
    address: "Adres",
    taxNumber: "Vergi No",
    taxOffice: "Vergi Dairesi",
    currency: "Para Birimi",
    timezone: "Saat Dilimi",
    save: "Degisiklikleri Kaydet",
    saving: "Kaydediliyor...",
    saved: "Ayarlar kaydedildi",
    saveFailed: "Kaydetme basarisiz",
    // Working Hours
    workingHoursTitle: "Calisma Saatleri",
    workingHoursDesc: "Haftanin her gunu icin salonunuzun acilis ve kapanis saatlerini belirleyin.",
    days: ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"],
    open: "Acik",
    closed: "Kapali",
    openTime: "Acilis",
    closeTime: "Kapanis",
    lunchStart: "Oglen Arasi Baslangic",
    lunchEnd: "Oglen Arasi Bitis",
    addLunch: "Oglen Arasi Ekle",
    removeLunch: "Kaldir",
    // Holidays
    holidaysTitle: "Tatil Gunleri",
    holidaysDesc: "Salonunuzun kapali olacagi tatil gunlerini tanimlayin.",
    date: "Tarih",
    description: "Aciklama",
    recurring: "Her Yil Tekrarla",
    addHoliday: "Tatil Ekle",
    deleteHoliday: "Sil",
    noHolidays: "Tanimli tatil gunu yok.",
    // Appointment
    appointmentTitle: "Randevu Ayarlari",
    appointmentDesc: "Salonunuzda randevularin nasil calisacagini yapilandirin.",
    slotDuration: "Slot Suresi (dakika)",
    autoConfirm: "Otomatik Randevu Onaylama",
    autoConfirmDesc: "Yeni randevulari manuel onay olmadan otomatik olarak onaylayin.",
    bufferTime: "Randevular Arasi Tampon Sure (dakika)",
    reminderHour: "Randevudan Kac Saat Once Hatirlatma",
    // Notifications
    notificationTitle: "Bildirim Ayarlari",
    notificationDesc: "Musterilerin bildirimleri nasil alacagini yapilandirin.",
    smsEnabled: "SMS Bildirimleri",
    emailEnabled: "E-posta Bildirimleri",
    whatsappEnabled: "WhatsApp Bildirimleri",
    whatsappTitle: "WhatsApp Entegrasyonu",
    whatsappDesc: "WhatsApp Business API bilgilerinizi yapilandirin.",
    apiToken: "API Token",
    instanceId: "Instance ID",
    loading: "Yukleniyor...",
    unauthorized: "Ayarlara erismek icin Owner veya Admin rolune ihtiyaciniz var.",
  },
};

const DEFAULT_WORKING_HOURS: WorkingHourDay[] = [
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "17:00", lunchBreakStart: null, lunchBreakEnd: null },
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "17:00", lunchBreakStart: null, lunchBreakEnd: null },
];

const CURRENCIES = [
  { code: "TRY", label: "TRY - Turk Lirasi" },
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
];

const TIMEZONES = [
  { value: "Europe/Istanbul", label: "Europe/Istanbul (UTC+3)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+1)" },
  { value: "America/New_York", label: "America/New_York (UTC-5)" },
];

const SLOT_OPTIONS = [15, 30, 45, 60];

// ─── Tab Icons ───
const TabIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "store":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "clock":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "booking":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "bell":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── Toggle Component ───
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-14 rounded-full transition-colors duration-200 ${checked ? "bg-gradient-to-r from-[#f3a4ff] to-[#ffd1dc]" : "bg-white/20"}`}
  >
    <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? "left-7" : "left-0.5"}`} />
  </button>
);

export default function SettingsScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const text = copy[language];
  const isOwner = user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: "",
    phone: "",
    address: "",
    taxNumber: "",
    taxOffice: "",
    currency: "TRY",
    timezone: "Europe/Istanbul",
  });

  // Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHourDay[]>(DEFAULT_WORKING_HOURS);

  // Holidays
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", description: "", isRecurring: false });

  // Appointment settings
  const [appointmentForm, setAppointmentForm] = useState({
    appointmentSlotMinutes: 30,
    autoConfirmAppointments: false,
    bufferMinutes: 0,
    reminderHourBefore: 24,
  });

  // Notification settings
  const [notifForm, setNotifForm] = useState({
    smsEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
    reminderHourBefore: 24,
  });

  // WhatsApp integration
  const [whatsapp, setWhatsapp] = useState<WhatsappIntegration>({
    whatsappApiToken: "",
    whatsappInstanceId: "",
  });

  // Notification rules (from old system)
  const [rules, setRules] = useState<NotificationRule[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, rulesRes, waRes] = await Promise.allSettled([
        tenantService.getFullSettings(),
        notificationService.getRules(),
        notificationService.getWhatsapp(),
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value.data.success && settingsRes.value.data.data) {
        const s = settingsRes.value.data.data;
        setProfileForm({
          companyName: s.companyName || "",
          phone: s.phone || "",
          address: s.address || "",
          taxNumber: s.taxNumber || "",
          taxOffice: s.taxOffice || "",
          currency: s.currency || "TRY",
          timezone: s.timezone || "Europe/Istanbul",
        });

        setAppointmentForm({
          appointmentSlotMinutes: s.appointmentSlotMinutes || 30,
          autoConfirmAppointments: s.autoConfirmAppointments || false,
          bufferMinutes: 0,
          reminderHourBefore: s.reminderHourBefore || 24,
        });

        setNotifForm(prev => ({
          ...prev,
          reminderHourBefore: s.reminderHourBefore || 24,
        }));

        // Parse working hours JSON
        if (s.workingHoursJson) {
          try {
            const parsed = JSON.parse(s.workingHoursJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setWorkingHours(parsed);
            }
          } catch { /* use defaults */ }
        }

        // Parse holidays JSON
        if (s.holidaysJson) {
          try {
            const parsed = JSON.parse(s.holidaysJson);
            if (Array.isArray(parsed)) {
              setHolidays(parsed);
            }
          } catch { /* use defaults */ }
        }
      }

      if (rulesRes.status === "fulfilled" && rulesRes.value.data.success && rulesRes.value.data.data) {
        const r = rulesRes.value.data.data;
        setRules(r);
        // Map rules to form
        setNotifForm(prev => ({
          ...prev,
          smsEnabled: r.find(x => x.channel === 1)?.isActive ?? false,
          emailEnabled: r.find(x => x.channel === 2)?.isActive ?? false,
          whatsappEnabled: r.find(x => x.channel === 4)?.isActive ?? false,
        }));
      }

      if (waRes.status === "fulfilled" && waRes.value.data.success && waRes.value.data.data) {
        setWhatsapp(waRes.value.data.data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Save Handlers ───

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantService.updateProfile({
        companyName: profileForm.companyName || undefined,
        phone: profileForm.phone || undefined,
        address: profileForm.address || undefined,
        taxNumber: profileForm.taxNumber || undefined,
        taxOffice: profileForm.taxOffice || undefined,
        currency: profileForm.currency || undefined,
        timezone: profileForm.timezone || undefined,
      });
      toast.success(text.saved);
    } catch {
      toast.error(text.saveFailed);
    } finally { setSaving(false); }
  };

  const handleSaveWorkingHours = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantService.updateWorkingHours({
        workingHours: workingHours,
      });
      toast.success(text.saved);
    } catch {
      toast.error(text.saveFailed);
    } finally { setSaving(false); }
  };

  const handleSaveHolidays = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantService.updateHolidays({ holidays });
      toast.success(text.saved);
    } catch {
      toast.error(text.saveFailed);
    } finally { setSaving(false); }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date) return;
    setHolidays(prev => [
      ...prev,
      { ...newHoliday, id: Date.now().toString() },
    ]);
    setNewHoliday({ date: "", description: "", isRecurring: false });
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveAppointment = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantService.updateAppointmentSettings(appointmentForm);
      toast.success(text.saved);
    } catch {
      toast.error(text.saveFailed);
    } finally { setSaving(false); }
  };

  const handleSaveNotifications = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update notification rules via old system
      for (const rule of rules) {
        const shouldBeActive =
          rule.channel === 1 ? notifForm.smsEnabled :
          rule.channel === 2 ? notifForm.emailEnabled :
          rule.channel === 4 ? notifForm.whatsappEnabled :
          rule.isActive;

        if (rule.isActive !== shouldBeActive) {
          await notificationService.updateRule({ channel: rule.channel, isActive: shouldBeActive });
        }
      }

      // Save WhatsApp credentials
      await notificationService.saveWhatsapp(whatsapp);

      // Update reminder hour
      await tenantService.updateAppointmentSettings({
        ...appointmentForm,
        reminderHourBefore: notifForm.reminderHourBefore,
      });

      toast.success(text.saved);
      fetchData();
    } catch {
      toast.error(text.saveFailed);
    } finally { setSaving(false); }
  };

  // ─── Working Hours Helpers ───
  const updateDay = (dayIndex: number, field: keyof WorkingHourDay, value: string | boolean | null) => {
    setWorkingHours(prev => prev.map((d, i) => i === dayIndex ? { ...d, [field]: value } : d));
  };

  // ─── Input Classes ───
  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all";
  const labelClass = "text-xs font-medium uppercase tracking-wider text-white/50";
  const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5";
  const btnClass = "rounded-xl bg-gradient-to-r from-[#f3a4ff] to-[#ffd1dc] px-6 py-2.5 text-sm font-semibold text-[#1a1a2e] hover:opacity-90 disabled:opacity-50 transition-opacity";

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center p-20 text-white/60">
        {text.unauthorized}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          <span className="text-sm text-white/60">{text.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">{text.title}</h1>
        <p className="mt-1 text-sm text-white/50">{text.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5">
        {text.tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === i
                ? "bg-white/10 text-white shadow-lg shadow-white/5"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            <TabIcon type={tab.icon} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════ Tab 0: Salon Profile ═══════════════════ */}
      {activeTab === 0 && (
        <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-6">
          <div className={cardClass}>
            <div className="space-y-1">
              <label className={labelClass}>{text.salonName}</label>
              <input
                type="text"
                value={profileForm.companyName}
                onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>{text.phone}</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.address}</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>{text.taxNumber}</label>
                <input
                  type="text"
                  value={profileForm.taxNumber}
                  onChange={e => setProfileForm({ ...profileForm, taxNumber: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.taxOffice}</label>
                <input
                  type="text"
                  value={profileForm.taxOffice}
                  onChange={e => setProfileForm({ ...profileForm, taxOffice: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>{text.currency}</label>
                <select
                  value={profileForm.currency}
                  onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}
                  className={inputClass}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#1a1a2e]">{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.timezone}</label>
                <select
                  value={profileForm.timezone}
                  onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className={inputClass}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value} className="bg-[#1a1a2e]">{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* ═══════════════════ Tab 1: Working Hours ═══════════════════ */}
      {activeTab === 1 && (
        <form onSubmit={handleSaveWorkingHours} className="max-w-3xl space-y-6">
          <div className={cardClass}>
            <div>
              <h3 className="text-lg font-semibold">{text.workingHoursTitle}</h3>
              <p className="mt-1 text-sm text-white/40">{text.workingHoursDesc}</p>
            </div>

            <div className="space-y-3">
              {workingHours.map((day, i) => {
                // Map dayOfWeek to display order: 1=Mon, 2=Tue, ... 6=Sat, 0=Sun
                const dayLabel = day.dayOfWeek === 0 ? text.days[6] : text.days[day.dayOfWeek - 1];
                return (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Day name and toggle */}
                      <div className="flex items-center gap-3 w-40">
                        <Toggle checked={day.isOpen} onChange={v => updateDay(i, "isOpen", v)} />
                        <span className={`text-sm font-medium ${day.isOpen ? "text-white" : "text-white/30"}`}>
                          {dayLabel}
                        </span>
                      </div>

                      {day.isOpen && (
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40">{text.openTime}</span>
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={e => updateDay(i, "openTime", e.target.value)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none [color-scheme:dark]"
                            />
                          </div>
                          <span className="text-white/20">-</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40">{text.closeTime}</span>
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={e => updateDay(i, "closeTime", e.target.value)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      )}

                      {!day.isOpen && (
                        <span className="text-xs text-white/20 uppercase tracking-wider">{text.closed}</span>
                      )}
                    </div>

                    {/* Lunch break */}
                    {day.isOpen && (
                      <div className="mt-3 ml-[172px]">
                        {day.lunchBreakStart ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40">{text.lunchStart}</span>
                              <input
                                type="time"
                                value={day.lunchBreakStart || "12:00"}
                                onChange={e => updateDay(i, "lunchBreakStart", e.target.value)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none [color-scheme:dark]"
                              />
                            </div>
                            <span className="text-white/20">-</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40">{text.lunchEnd}</span>
                              <input
                                type="time"
                                value={day.lunchBreakEnd || "13:00"}
                                onChange={e => updateDay(i, "lunchBreakEnd", e.target.value)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none [color-scheme:dark]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => { updateDay(i, "lunchBreakStart", null); updateDay(i, "lunchBreakEnd", null); }}
                              className="text-xs text-red-400/70 hover:text-red-400 transition"
                            >
                              {text.removeLunch}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { updateDay(i, "lunchBreakStart", "12:00"); updateDay(i, "lunchBreakEnd", "13:00"); }}
                            className="text-xs text-white/30 hover:text-white/60 transition"
                          >
                            + {text.addLunch}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* ═══════════════════ Tab 2: Holidays ═══════════════════ */}
      {activeTab === 2 && (
        <form onSubmit={handleSaveHolidays} className="max-w-3xl space-y-6">
          <div className={cardClass}>
            <div>
              <h3 className="text-lg font-semibold">{text.holidaysTitle}</h3>
              <p className="mt-1 text-sm text-white/40">{text.holidaysDesc}</p>
            </div>

            {/* Add new holiday */}
            <div className="rounded-xl border border-dashed border-white/10 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>{text.date}</label>
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </div>
                <div className="space-y-1 flex-[2] min-w-[180px]">
                  <label className={labelClass}>{text.description}</label>
                  <input
                    type="text"
                    value={newHoliday.description}
                    onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })}
                    placeholder={language === "tr" ? "ornek: Yilbasi" : "e.g. New Year"}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2 pb-0.5">
                  <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHoliday.isRecurring}
                      onChange={e => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                      className="rounded border-white/20 bg-white/5 text-[#f3a4ff] focus:ring-0"
                    />
                    {text.recurring}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  disabled={!newHoliday.date}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-30 transition"
                >
                  {text.addHoliday}
                </button>
              </div>
            </div>

            {/* Holiday list */}
            {holidays.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-6">{text.noHolidays}</p>
            ) : (
              <div className="divide-y divide-white/5">
                {holidays.map(h => (
                  <div key={h.id} className="flex items-center justify-between py-3 px-2">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xs font-mono text-white/60">
                        {new Date(h.date + "T00:00:00").toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{h.description || "-"}</p>
                        <p className="text-xs text-white/40">
                          {h.isRecurring ? (language === "tr" ? "Her yil tekrarlar" : "Repeats annually") : (language === "tr" ? "Tek seferlik" : "One-time")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="text-xs text-red-400/60 hover:text-red-400 transition"
                    >
                      {text.deleteHoliday}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* ═══════════════════ Tab 3: Appointment Settings ═══════════════════ */}
      {activeTab === 3 && (
        <form onSubmit={handleSaveAppointment} className="max-w-3xl space-y-6">
          <div className={cardClass}>
            <div>
              <h3 className="text-lg font-semibold">{text.appointmentTitle}</h3>
              <p className="mt-1 text-sm text-white/40">{text.appointmentDesc}</p>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{text.slotDuration}</label>
              <div className="flex gap-2">
                {SLOT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAppointmentForm({ ...appointmentForm, appointmentSlotMinutes: opt })}
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                      appointmentForm.appointmentSlotMinutes === opt
                        ? "bg-gradient-to-r from-[#f3a4ff] to-[#ffd1dc] text-[#1a1a2e] shadow-lg"
                        : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {opt} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-medium">{text.autoConfirm}</p>
                <p className="text-xs text-white/40 mt-0.5">{text.autoConfirmDesc}</p>
              </div>
              <Toggle
                checked={appointmentForm.autoConfirmAppointments}
                onChange={v => setAppointmentForm({ ...appointmentForm, autoConfirmAppointments: v })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>{text.bufferTime}</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={appointmentForm.bufferMinutes}
                  onChange={e => setAppointmentForm({ ...appointmentForm, bufferMinutes: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.reminderHour}</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={appointmentForm.reminderHourBefore}
                  onChange={e => setAppointmentForm({ ...appointmentForm, reminderHourBefore: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* ═══════════════════ Tab 4: Notifications ═══════════════════ */}
      {activeTab === 4 && (
        <form onSubmit={handleSaveNotifications} className="max-w-3xl space-y-6">
          <div className={cardClass}>
            <div>
              <h3 className="text-lg font-semibold">{text.notificationTitle}</h3>
              <p className="mt-1 text-sm text-white/40">{text.notificationDesc}</p>
            </div>

            {/* Channel toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <span className="text-sm font-medium">{text.smsEnabled}</span>
                </div>
                <Toggle checked={notifForm.smsEnabled} onChange={v => setNotifForm({ ...notifForm, smsEnabled: v })} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <span className="text-sm font-medium">{text.emailEnabled}</span>
                </div>
                <Toggle checked={notifForm.emailEnabled} onChange={v => setNotifForm({ ...notifForm, emailEnabled: v })} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                  </div>
                  <span className="text-sm font-medium">{text.whatsappEnabled}</span>
                </div>
                <Toggle checked={notifForm.whatsappEnabled} onChange={v => setNotifForm({ ...notifForm, whatsappEnabled: v })} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{text.reminderHour}</label>
              <input
                type="number"
                min={1}
                max={72}
                value={notifForm.reminderHourBefore}
                onChange={e => setNotifForm({ ...notifForm, reminderHourBefore: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          {/* WhatsApp Integration */}
          {notifForm.whatsappEnabled && (
            <div className={cardClass}>
              <div>
                <h3 className="text-lg font-semibold">{text.whatsappTitle}</h3>
                <p className="mt-1 text-sm text-white/40">{text.whatsappDesc}</p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.apiToken}</label>
                <input
                  type="text"
                  value={whatsapp.whatsappApiToken || ""}
                  onChange={e => setWhatsapp({ ...whatsapp, whatsappApiToken: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.instanceId}</label>
                <input
                  type="text"
                  value={whatsapp.whatsappInstanceId || ""}
                  onChange={e => setWhatsapp({ ...whatsapp, whatsappInstanceId: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className={btnClass}>
            {saving ? text.saving : text.save}
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notificationService";
import { tenantService } from "@/services/tenantService";
import type {
  TenantSettings,
  NotificationRule,
  WhatsappIntegration,
} from "@/services/notificationService";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Settings",
    // Tabs
    tabs: ["Business Info", "Notifications", "WhatsApp", "Staff Invite"],
    // Business Info
    companyName: "Company Name",
    phone: "Phone",
    address: "Address",
    taxNumber: "Tax Number",
    taxOffice: "Tax Office",
    reminderHour: "Reminder Hours Before Appointment",
    save: "Save",
    saving: "Saving...",
    // Notifications
    notificationTitle: "Notification Channels",
    notificationDesc: "Enable/disable notification channels for your salon.",
    // WhatsApp
    whatsappTitle: "WhatsApp Integration",
    whatsappDesc: "Configure your WhatsApp Business API credentials to send appointment reminders to customers.",
    apiToken: "API Token",
    instanceId: "Instance ID",
    whatsappSaved: "WhatsApp settings saved.",
    // Staff Invite
    inviteTitle: "Invite Staff",
    inviteDesc: "Generate a one-time invite token. Share it with your staff member so they can register.",
    generateToken: "Generate Invite Token",
    generating: "Generating...",
    tokenGenerated: "Token generated! Share this with your staff:",
    tokenExpiry: "This token expires in 24 hours and can only be used once.",
    copyToken: "Copy",
    copied: "Copied!",
    loading: "Loading...",
  },
  tr: {
    title: "Ayarlar",
    tabs: ["İşletme Bilgileri", "Bildirimler", "WhatsApp", "Personel Davet"],
    companyName: "Şirket Adı",
    phone: "Telefon",
    address: "Adres",
    taxNumber: "Vergi No",
    taxOffice: "Vergi Dairesi",
    reminderHour: "Randevudan Kaç Saat Önce Hatırlatma",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    notificationTitle: "Bildirim Kanalları",
    notificationDesc: "Salonunuz için bildirim kanallarını açın/kapatın.",
    whatsappTitle: "WhatsApp Entegrasyonu",
    whatsappDesc: "Müşterilere randevu hatırlatması göndermek için WhatsApp Business API bilgilerinizi yapılandırın.",
    apiToken: "API Token",
    instanceId: "Instance ID",
    whatsappSaved: "WhatsApp ayarları kaydedildi.",
    inviteTitle: "Personel Davet Et",
    inviteDesc: "Tek kullanımlık davet kodu oluşturun. Personelinizle paylaşın, kayıt olabilsinler.",
    generateToken: "Davet Kodu Oluştur",
    generating: "Oluşturuluyor...",
    tokenGenerated: "Kod oluşturuldu! Personelinizle paylaşın:",
    tokenExpiry: "Bu kod 24 saat geçerlidir ve yalnızca bir kez kullanılabilir.",
    copyToken: "Kopyala",
    copied: "Kopyalandı!",
    loading: "Yükleniyor...",
  },
};

const CHANNEL_ICONS: Record<string, string> = {
  SMS: "💬",
  Email: "📧",
  "Push Notification": "🔔",
  WhatsApp: "📱",
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const text = copy[language];
  const isOwner = user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Business info
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    phone: "", address: "", taxNumber: "", taxOffice: "", reminderHourBefore: 24,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification rules
  const [rules, setRules] = useState<NotificationRule[]>([]);

  // WhatsApp
  const [whatsapp, setWhatsapp] = useState<WhatsappIntegration>({
    whatsappApiToken: "", whatsappInstanceId: "",
  });
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Staff invite
  const [inviteToken, setInviteToken] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, rulesRes, waRes] = await Promise.allSettled([
        notificationService.getSettings(),
        notificationService.getRules(),
        notificationService.getWhatsapp(),
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value.data.success && settingsRes.value.data.data) {
        const s = settingsRes.value.data.data;
        setSettings(s);
        setSettingsForm({
          phone: s.phone || "",
          address: s.address || "",
          taxNumber: s.taxNumber || "",
          taxOffice: s.taxOffice || "",
          reminderHourBefore: s.reminderHourBefore,
        });
      }
      if (rulesRes.status === "fulfilled" && rulesRes.value.data.success && rulesRes.value.data.data) {
        setRules(rulesRes.value.data.data);
      }
      if (waRes.status === "fulfilled" && waRes.value.data.success && waRes.value.data.data) {
        setWhatsapp(waRes.value.data.data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Save business settings
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await notificationService.updateSettings({
        phone: settingsForm.phone || undefined,
        address: settingsForm.address || undefined,
        taxNumber: settingsForm.taxNumber || undefined,
        taxOffice: settingsForm.taxOffice || undefined,
        reminderHourBefore: settingsForm.reminderHourBefore,
      });
      toast.success(language === "tr" ? "Ayarlar kaydedildi" : "Settings saved");
    } catch {
      toast.error(language === "tr" ? "Kaydetme başarısız" : "Save failed");
    } finally { setSavingSettings(false); }
  };

  // Toggle notification rule
  const toggleRule = async (channel: number, currentActive: boolean) => {
    try {
      await notificationService.updateRule({ channel, isActive: !currentActive });
      setRules((prev) => prev.map((r) => r.channel === channel ? { ...r, isActive: !currentActive } : r));
      toast.success(language === "tr" ? "Kanal güncellendi" : "Channel updated");
    } catch {
      toast.error(language === "tr" ? "Güncelleme başarısız" : "Update failed");
    }
  };

  // Save WhatsApp
  const handleSaveWhatsapp = async (e: FormEvent) => {
    e.preventDefault();
    setSavingWhatsapp(true);
    try {
      await notificationService.saveWhatsapp(whatsapp);
      toast.success(text.whatsappSaved);
    } catch {
      toast.error(language === "tr" ? "Kaydetme başarısız" : "Save failed");
    } finally { setSavingWhatsapp(false); }
  };

  // Generate invite token
  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const res = await tenantService.generateInviteToken();
      if (res.data.success && res.data.data) {
        setInviteToken(res.data.data.token);
        toast.success(language === "tr" ? "Davet kodu oluşturuldu" : "Invite token generated");
      }
    } catch {
      toast.error(language === "tr" ? "Oluşturma başarısız" : "Generation failed");
    } finally { setGeneratingToken(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteToken);
    toast.success(text.copied);
  };

  if (loading) {
    return <div className="p-8 text-center text-white/60">{text.loading}</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-semibold">{text.title}</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {text.tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === i ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0: Business Info */}
      {activeTab === 0 && isOwner && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.companyName}</label>
              <input type="text" value={settings?.companyName || ""} disabled
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">{text.phone}</label>
                <input type="tel" value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">{text.reminderHour}</label>
                <input type="number" min={1} max={72} value={settingsForm.reminderHourBefore}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reminderHourBefore: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.address}</label>
              <input type="text" value={settingsForm.address} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">{text.taxNumber}</label>
                <input type="text" value={settingsForm.taxNumber} onChange={(e) => setSettingsForm({ ...settingsForm, taxNumber: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">{text.taxOffice}</label>
                <input type="text" value={settingsForm.taxOffice} onChange={(e) => setSettingsForm({ ...settingsForm, taxOffice: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={savingSettings}
            className="rounded-xl bg-[#00a651] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50">
            {savingSettings ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* Tab 1: Notification Rules */}
      {activeTab === 1 && isOwner && (
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-white/60">{text.notificationDesc}</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
            {rules.map((rule) => (
              <div key={rule.channel} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CHANNEL_ICONS[rule.channelName] || "📢"}</span>
                  <span className="font-medium">{rule.channelName}</span>
                </div>
                <button onClick={() => toggleRule(rule.channel, rule.isActive)}
                  className={`relative h-7 w-14 rounded-full transition ${rule.isActive ? "bg-emerald-500" : "bg-white/20"}`}>
                  <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${rule.isActive ? "left-7" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp */}
      {activeTab === 2 && isOwner && (
        <form onSubmit={handleSaveWhatsapp} className="max-w-2xl space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{text.whatsappTitle}</h3>
              <p className="mt-1 text-sm text-white/50">{text.whatsappDesc}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.apiToken}</label>
              <input type="text" value={whatsapp.whatsappApiToken || ""}
                onChange={(e) => setWhatsapp({ ...whatsapp, whatsappApiToken: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.instanceId}</label>
              <input type="text" value={whatsapp.whatsappInstanceId || ""}
                onChange={(e) => setWhatsapp({ ...whatsapp, whatsappInstanceId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none font-mono" />
            </div>
          </div>
          <button type="submit" disabled={savingWhatsapp}
            className="rounded-xl bg-[#00a651] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50">
            {savingWhatsapp ? text.saving : text.save}
          </button>
        </form>
      )}

      {/* Tab 3: Staff Invite */}
      {activeTab === 3 && isOwner && (
        <div className="max-w-2xl space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{text.inviteTitle}</h3>
              <p className="mt-1 text-sm text-white/50">{text.inviteDesc}</p>
            </div>

            <button onClick={handleGenerateToken} disabled={generatingToken}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
              {generatingToken ? text.generating : text.generateToken}
            </button>

            {inviteToken && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                <p className="text-sm font-medium text-emerald-400">{text.tokenGenerated}</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded-lg bg-black/30 px-4 py-3 text-lg font-mono font-bold text-white tracking-widest">
                    {inviteToken}
                  </code>
                  <button onClick={copyToClipboard}
                    className="rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20">
                    {text.copyToken}
                  </button>
                </div>
                <p className="text-xs text-white/40">{text.tokenExpiry}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

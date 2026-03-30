"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionPlan } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ===============================================
   CONSTANTS
   =============================================== */

const copy = {
  en: {
    title: "Package Management",
    subtitle: "Manage subscription plans and pricing",
    loading: "Loading...",
    noPlans: "No plans found.",
    // Table headers
    planName: "Plan Name",
    monthlyPrice: "Monthly Price",
    yearlyPrice: "Yearly Price",
    maxStaff: "Max Staff",
    maxBranch: "Max Branch",
    features: "Features",
    status: "Status",
    actions: "Actions",
    // Status
    active: "Active",
    disabled: "Disabled",
    // Actions
    edit: "Edit",
    toggle: "Toggle Status",
    // Edit modal
    editTitle: "Edit Plan",
    description: "Description",
    descriptionPh: "Plan description...",
    namePh: "Plan name",
    sms: "SMS Integration",
    whatsapp: "WhatsApp Integration",
    socialMedia: "Social Media Integration",
    validityMonths: "Validity (months)",
    save: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    savedOk: "Plan updated successfully",
    toggledOk: "Plan status changed",
    unauthorized: "You do not have permission to access this page.",
    yes: "Yes",
    no: "No",
    unlimited: "Unlimited",
    // Tenant assignment
    tenantSection: "Assign Plan to Store",
    tenantSectionSub: "Assign subscription plans to stores (bypasses payment)",
    storeName: "Store",
    currentPlan: "Current Plan",
    noPlan: "No plan",
    trial: "Trial",
    assignPlan: "Assign Plan",
    selectPlan: "Select plan...",
    selectStore: "Select store...",
    yearly: "Yearly",
    monthly: "Monthly",
    assignBtn: "Assign",
    assigning: "Assigning...",
    assignedOk: "Plan assigned successfully",
    loadingTenants: "Loading stores...",
    noTenants: "No stores found.",
  },
  tr: {
    title: "Paket Yönetimi",
    subtitle: "Abonelik paketlerini ve fiyatlandırmayı yönetin",
    loading: "Yükleniyor...",
    noPlans: "Plan bulunamadı.",
    planName: "Plan Adı",
    monthlyPrice: "Aylık Fiyat",
    yearlyPrice: "Yıllık Fiyat",
    maxStaff: "Maks Personel",
    maxBranch: "Maks Şube",
    features: "Özellikler",
    status: "Durum",
    actions: "İşlemler",
    active: "Aktif",
    disabled: "Devre Dışı",
    edit: "Düzenle",
    toggle: "Durumu Değiştir",
    editTitle: "Planı Düzenle",
    description: "Açıklama",
    descriptionPh: "Plan açıklaması...",
    namePh: "Plan adı",
    sms: "SMS Entegrasyonu",
    whatsapp: "WhatsApp Mesaj Entegrasyonu",
    socialMedia: "Sosyal Medya Entegrasyonu",
    validityMonths: "Geçerlilik Süresi (ay)",
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    savedOk: "Plan başarıyla güncellendi",
    toggledOk: "Plan durumu değiştirildi",
    unauthorized: "Bu sayfaya erişim yetkiniz yok.",
    yes: "Evet",
    no: "Hayır",
    unlimited: "Sınırsız",
    tenantSection: "Mağazaya Plan Ata",
    tenantSectionSub: "Mağazalara abonelik planı atayın (ödemeyi atlar)",
    storeName: "Mağaza",
    currentPlan: "Mevcut Plan",
    noPlan: "Plan yok",
    trial: "Deneme",
    assignPlan: "Plan Ata",
    selectPlan: "Plan seçin...",
    selectStore: "Mağaza seçin...",
    yearly: "Yıllık",
    monthly: "Aylık",
    assignBtn: "Ata",
    assigning: "Atanıyor...",
    assignedOk: "Plan başarıyla atandı",
    loadingTenants: "Mağazalar yükleniyor...",
    noTenants: "Mağaza bulunamadı.",
  },
};

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ===============================================
   MAIN COMPONENT
   =============================================== */

export default function SubscriptionManagementScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const router = useRouter();
  const t = copy[language];

  const isSuperAdmin = user?.roles?.includes("SuperAdmin") ?? false;

  const PLAN_NAME_MAP: Record<string, { en: string; tr: string }> = {
    "Başlangıç Paketi": { en: "Starter Package", tr: "Başlangıç Paketi" },
    "Gold Paketi": { en: "Gold Package", tr: "Gold Paketi" },
    "Platinum Paketi": { en: "Platinum Package", tr: "Platinum Paketi" },
  };
  const getLocalizedPlanName = (name: string) => PLAN_NAME_MAP[name]?.[language] ?? name;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tenant assignment state
  type TenantItem = { id: number; companyName: string; phone: string; cDate: string; activeSubscription: { name: string; startDate: string; endDate: string; isTrialPeriod: boolean } | null };
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [assignTenantId, setAssignTenantId] = useState(0);
  const [assignPlanId, setAssignPlanId] = useState(0);
  const [assignYearly, setAssignYearly] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Edit form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMonthlyPrice, setFormMonthlyPrice] = useState(0);
  const [formYearlyPrice, setFormYearlyPrice] = useState(0);
  const [formMaxStaff, setFormMaxStaff] = useState(0);
  const [formMaxBranch, setFormMaxBranch] = useState(0);
  const [formSms, setFormSms] = useState(false);
  const [formWhatsapp, setFormWhatsapp] = useState(false);
  const [formSocialMedia, setFormSocialMedia] = useState(false);
  const [formValidityMonths, setFormValidityMonths] = useState(1);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.adminListPlans();
      if (res.data.success && res.data.data) {
        setPlans(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Planlar yüklenemedi" : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [language]);

  const fetchTenants = useCallback(async () => {
    setTenantsLoading(true);
    try {
      const res = await subscriptionService.adminGetTenants();
      if (res.data.success && res.data.data) {
        setTenants(res.data.data);
      }
    } catch {
      // silent
    } finally {
      setTenantsLoading(false);
    }
  }, []);

  const handleAssignPlan = async () => {
    if (!assignTenantId || !assignPlanId) return;
    setAssigning(true);
    try {
      const res = await subscriptionService.adminAssignPlan(assignTenantId, assignPlanId, assignYearly);
      if (res.data.success) {
        toast.success(t.assignedOk);
        setAssignTenantId(0);
        setAssignPlanId(0);
        fetchTenants();
      }
    } catch {
      toast.error(language === "tr" ? "Plan atanamadı" : "Failed to assign plan");
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchPlans();
    fetchTenants();
  }, [isSuperAdmin, router, fetchPlans, fetchTenants]);

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormDescription(plan.description || "");
    setFormMonthlyPrice(plan.monthlyPrice);
    setFormYearlyPrice(plan.yearlyPrice);
    setFormMaxStaff(plan.maxStaffCount);
    setFormMaxBranch(plan.maxBranchCount);
    setFormSms(plan.hasSmsIntegration);
    setFormWhatsapp(plan.hasWhatsappIntegration);
    setFormSocialMedia(plan.hasSocialMediaIntegration);
    setFormValidityMonths(plan.validityMonths || 1);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      const res = await subscriptionService.adminUpdatePlan(editingPlan.id, {
        name: formName,
        description: formDescription || null,
        monthlyPrice: formMonthlyPrice,
        yearlyPrice: formYearlyPrice,
        maxStaffCount: formMaxStaff,
        maxBranchCount: formMaxBranch,
        hasSmsIntegration: formSms,
        hasWhatsappIntegration: formWhatsapp,
        hasSocialMediaIntegration: formSocialMedia,
        hasAiFeatures: false,
        validityMonths: formValidityMonths,
      });
      if (res.data.success) {
        toast.success(t.savedOk);
        setShowEditModal(false);
        fetchPlans();
      }
    } catch {
      toast.error(language === "tr" ? "Güncelleme başarısız" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (planId: number) => {
    try {
      const res = await subscriptionService.adminTogglePlan(planId);
      if (res.data.success) {
        toast.success(t.toggledOk);
        fetchPlans();
      }
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className={`flex items-center justify-center p-16 ${isDark ? "text-white/40" : "text-gray-400"}`}>
        {t.unauthorized}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-3 p-16 ${isDark ? "text-white/40" : "text-gray-400"}`}>
        <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
        {t.loading}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.subtitle}</p>
      </div>

      {/* --- PLANS GRID --- */}
      {plans.length === 0 ? (
        <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} p-12`}>
          <svg className={isDark ? "text-white/20" : "text-gray-300"} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noPlans}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isActive = plan.isActive !== false;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
                  isActive
                    ? isDark ? "border-white/[0.08] bg-white/[0.02] hover:border-white/15" : "border-gray-200 bg-white hover:border-gray-300"
                    : "border-red-500/10 bg-red-500/[0.02] opacity-60"
                }`}
              >
                {/* Status Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{getLocalizedPlanName(plan.name)}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      isActive
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {isActive ? t.active : t.disabled}
                  </span>
                </div>

                {plan.description && (
                  <p className={`mb-3 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{plan.description}</p>
                )}

                {/* Pricing */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2.5`}>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-500"} tracking-wider`}>{t.monthlyPrice}</p>
                    <p className={`mt-0.5 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {"\u20BA"}{fmt(plan.monthlyPrice)}
                    </p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2.5`}>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-500"} tracking-wider`}>{t.yearlyPrice}</p>
                    <p className={`mt-0.5 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {"\u20BA"}{fmt(plan.yearlyPrice)}
                    </p>
                  </div>
                </div>

                {/* Limits */}
                <div className="mb-4 flex gap-3">
                  <div className={`flex-1 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2`}>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-500"}`}>{t.maxStaff}</p>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {plan.maxStaffCount <= 0 ? t.unlimited : plan.maxStaffCount}
                    </p>
                  </div>
                  <div className={`flex-1 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2`}>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-500"}`}>{t.maxBranch}</p>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {plan.maxBranchCount <= 0 ? t.unlimited : plan.maxBranchCount}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-5 flex-1 space-y-2">
                  <FeatureItem label={t.sms} enabled={plan.hasSmsIntegration} />
                  <FeatureItem label={t.whatsapp} enabled={plan.hasWhatsappIntegration} />
                  <FeatureItem label={t.socialMedia} enabled={plan.hasSocialMediaIntegration} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(plan)}
                    className={`flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleToggle(plan.id)}
                    className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${
                      isActive
                        ? "border-red-500/20 text-red-400"
                        : "border-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {isActive ? t.disabled : t.active}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- TENANT PLAN ASSIGNMENT --- */}
      <div className="mt-8">
        <h2 className="text-lg font-bold">{t.tenantSection}</h2>
        <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.tenantSectionSub}</p>

        {/* Assign form */}
        <div className={`mt-4 flex flex-wrap items-end gap-3 rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} p-5`}>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className={`text-xs font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.storeName}</label>
            <select
              value={assignTenantId}
              onChange={(e) => setAssignTenantId(Number(e.target.value))}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
            >
              <option value={0}>{t.selectStore}</option>
              {tenants.map((tn) => (
                <option key={tn.id} value={tn.id}>
                  {tn.companyName} (ID: {tn.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className={`text-xs font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.assignPlan}</label>
            <select
              value={assignPlanId}
              onChange={(e) => setAssignPlanId(Number(e.target.value))}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
            >
              <option value={0}>{t.selectPlan}</option>
              {plans.filter(p => p.isActive !== false).map((p) => (
                <option key={p.id} value={p.id}>{getLocalizedPlanName(p.name)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>&nbsp;</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAssignYearly(!assignYearly)}
                className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                  assignYearly
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : isDark ? "border-white/10 bg-white/5 text-white/50" : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {assignYearly ? t.yearly : t.monthly}
              </button>
              <button
                onClick={handleAssignPlan}
                disabled={!assignTenantId || !assignPlanId || assigning}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg disabled:opacity-40 transition-all hover:shadow-purple-900/40"
              >
                {assigning ? t.assigning : t.assignBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Tenant list */}
        {tenantsLoading ? (
          <p className={`mt-4 text-sm ${isDark ? "text-white/30" : "text-gray-500"}`}>{t.loadingTenants}</p>
        ) : tenants.length === 0 ? (
          <p className={`mt-4 text-sm ${isDark ? "text-white/30" : "text-gray-500"}`}>{t.noTenants}</p>
        ) : (
          <div className={`mt-4 rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} overflow-hidden`}>
            <table className="w-full text-left text-sm">
              <thead className={`${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t.storeName}</th>
                  <th className="px-4 py-3">{t.currentPlan}</th>
                  <th className="px-4 py-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
                {tenants.map((tn) => (
                  <tr key={tn.id} className={isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"}>
                    <td className={`px-4 py-3 ${isDark ? "text-white/50" : "text-gray-500"}`}>{tn.id}</td>
                    <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{tn.companyName}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                      {tn.activeSubscription
                        ? `${getLocalizedPlanName(tn.activeSubscription.name)}${tn.activeSubscription.isTrialPeriod ? ` (${t.trial})` : ""}`
                        : <span className="text-red-400">{t.noPlan}</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {tn.activeSubscription ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {t.active}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          {t.noPlan}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === EDIT MODAL === */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t.editTitle}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {t.planName}
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t.namePh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {t.description}
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={1}
              placeholder={t.descriptionPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                {t.monthlyPrice} (₺)
              </label>
              <input
                type="number"
                value={formMonthlyPrice}
                onChange={(e) => setFormMonthlyPrice(Number(e.target.value))}
                min={0}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                {t.yearlyPrice} (₺)
              </label>
              <input
                type="number"
                value={formYearlyPrice}
                onChange={(e) => setFormYearlyPrice(Number(e.target.value))}
                min={0}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                {t.maxStaff}
              </label>
              <input
                type="number"
                value={formMaxStaff}
                onChange={(e) => setFormMaxStaff(Number(e.target.value))}
                min={0}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                {t.maxBranch}
              </label>
              <input
                type="number"
                value={formMaxBranch}
                onChange={(e) => setFormMaxBranch(Number(e.target.value))}
                min={0}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
          </div>

          {/* Validity */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {t.validityMonths}
            </label>
            <input
              type="number"
              value={formValidityMonths}
              onChange={(e) => setFormValidityMonths(Number(e.target.value))}
              min={1}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
            />
          </div>

          {/* Feature Checkboxes */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {t.features}
            </label>
            <ToggleRow
              label={t.sms}
              checked={formSms}
              onChange={setFormSms}
              isDark={isDark}
            />
            <ToggleRow
              label={t.whatsapp}
              checked={formWhatsapp}
              onChange={setFormWhatsapp}
              isDark={isDark}
            />
            <ToggleRow
              label={t.socialMedia}
              checked={formSocialMedia}
              onChange={setFormSocialMedia}
              isDark={isDark}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className={`flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-purple-900/30 transition-all hover:shadow-purple-900/50 disabled:opacity-50`}
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* === Sub-components === */

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  const { theme } = useTheme();
  const dk = theme === "dark";
  return (
    <div className="flex items-center gap-2">
      <svg
        className={enabled ? "text-emerald-400" : dk ? "text-white/20" : "text-gray-300"}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        {enabled ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <line x1="18" y1="6" x2="6" y2="18" />
        )}
      </svg>
      <span className={`text-xs ${enabled ? (dk ? "text-white/60" : "text-gray-600") : (dk ? "text-white/20" : "text-gray-400")}`}>
        {label}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  isDark,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isDark: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center justify-between rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-4 py-3`}>
      <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-all ${
          checked ? "bg-emerald-500" : isDark ? "bg-white/15" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

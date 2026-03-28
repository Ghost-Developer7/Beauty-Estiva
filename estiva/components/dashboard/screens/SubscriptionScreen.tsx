"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionPlan, CurrentSubscription } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    title: "Subscription",
    subtitle: "Manage your plan and billing",
    currentPlan: "Current Plan",
    plans: "Available Plans",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "/mo",
    perYear: "/yr",
    maxStaff: "Staff Members",
    maxBranch: "Branches",
    sms: "SMS Integration",
    whatsapp: "WhatsApp Integration",
    socialMedia: "Social Media Integration",
    yes: "Included",
    no: "Not included",
    free_tag: "Free",
    select: "Choose Plan",
    currentBadge: "Current Plan",
    upgrade: "Upgrade",
    couponCode: "Coupon Code",
    couponPlaceholder: "Enter coupon code...",
    applyCoupon: "Apply",
    validating: "Checking...",
    couponValid: "Coupon applied!",
    couponInvalid: "Invalid coupon",
    discount: "Discount",
    finalPrice: "Final Price",
    free: "FREE",
    activateNow: "Activate Now (Free)",
    purchase: "Proceed to Payment",
    purchasing: "Processing...",
    startTrial: "Start 3-Day Free Trial",
    startingTrial: "Starting...",
    trialDesc: "Try all features free for 3 days. No credit card required.",
    cancel: "Cancel",
    cancelSubscription: "Cancel Subscription",
    cancelReason: "Why are you cancelling?",
    cancelReasonPh: "Tell us why you're leaving...",
    cancelConfirm: "Confirm Cancellation",
    cancelWarning: "Your access will continue until the end of the current billing period.",
    requestRefund: "Request a refund for the remaining period",
    paymentModal: "Complete Payment",
    paymentProcessing: "Complete your payment in the secure form below.",
    paymentLoading: "Loading payment form...",
    active: "Active",
    trial: "Trial",
    cancelled: "Cancelled",
    expired: "Expired",
    expiresOn: "Renews on",
    trialEndsOn: "Trial ends",
    daysLeft: "days left",
    noPlan: "No active subscription",
    noPlanDesc: "Choose a plan to unlock all features for your salon.",
    loading: "Loading...",
    saveYearly: "Save up to 20%",
    unlimited: "Unlimited",
    popular: "Popular",
    /* plan name translations (API returns Turkish names) */
    planNames: {
      "Başlangıç": "Starter",
      "Profesyonel": "Professional",
      "Kurumsal": "Enterprise",
      "Deneme": "Trial",
      "Temel": "Basic",
      "Premium": "Premium",
      "İleri": "Advanced",
    } as Record<string, string>,
  },
  tr: {
    title: "Abonelik",
    subtitle: "Plan ve faturalandırmanızı yönetin",
    currentPlan: "Mevcut Plan",
    plans: "Mevcut Planlar",
    monthly: "Aylık",
    yearly: "Yıllık",
    perMonth: "/ay",
    perYear: "/yıl",
    maxStaff: "Personel Sayısı",
    maxBranch: "Şube Sayısı",
    sms: "SMS Entegrasyonu",
    whatsapp: "WhatsApp Mesaj Entegrasyonu",
    socialMedia: "Sosyal Medya Entegrasyonu",
    yes: "Dahil",
    no: "Dahil değil",
    free_tag: "Hediye",
    select: "Planı Seç",
    currentBadge: "Mevcut Plan",
    upgrade: "Yükselt",
    couponCode: "Kupon Kodu",
    couponPlaceholder: "Kupon kodu girin...",
    applyCoupon: "Uygula",
    validating: "Kontrol ediliyor...",
    couponValid: "Kupon uygulandı!",
    couponInvalid: "Geçersiz kupon",
    discount: "İndirim",
    finalPrice: "Ödenecek Tutar",
    free: "ÜCRETSİZ",
    activateNow: "Şimdi Aktifleştir (Ücretsiz)",
    purchase: "Ödemeye Geç",
    purchasing: "İşleniyor...",
    startTrial: "3 Günlük Ücretsiz Denemeyi Başlat",
    startingTrial: "Başlatılıyor...",
    trialDesc: "Tüm özellikleri 3 gün ücretsiz deneyin. Kredi kartı gerekmez.",
    cancel: "Vazgeç",
    cancelSubscription: "Aboneliği İptal Et",
    cancelReason: "Neden iptal ediyorsunuz?",
    cancelReasonPh: "Ayrılma nedeninizi paylaşın...",
    cancelConfirm: "İptali Onayla",
    cancelWarning: "Erişiminiz mevcut faturalandırma döneminin sonuna kadar devam eder.",
    requestRefund: "Kalan süre için iade talep et",
    paymentModal: "Ödemeyi Tamamlayın",
    paymentProcessing: "Aşağıdaki güvenli formdan ödemenizi tamamlayın.",
    paymentLoading: "Ödeme formu yükleniyor...",
    active: "Aktif",
    trial: "Deneme",
    cancelled: "İptal Edildi",
    expired: "Süresi Doldu",
    expiresOn: "Yenileme Tarihi",
    trialEndsOn: "Deneme Bitiş",
    daysLeft: "gün kaldı",
    noPlan: "Aktif abonelik yok",
    noPlanDesc: "Salonunuzun tüm özelliklerini açmak için bir plan seçin.",
    loading: "Yükleniyor...",
    saveYearly: "%20'ye varan tasarruf",
    unlimited: "Sınırsız",
    popular: "Popüler",
    planNames: {} as Record<string, string>, /* Turkish: no mapping needed, API already returns Turkish */
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number, lang: string) =>
  n.toLocaleString(lang === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (d: string | null, lang: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });
};

const translatePlanName = (name: string, planNames: Record<string, string>) =>
  planNames[name] || name;

function getDaysLeft(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function SubscriptionScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ isValid: boolean; discountAmount: number | null; message: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [requestRefund, setRequestRefund] = useState(false);

  const [startingTrial, setStartingTrial] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.allSettled([
        subscriptionService.listPlans(),
        subscriptionService.getCurrent(),
      ]);
      if (plansRes.status === "fulfilled" && plansRes.value.data.success && plansRes.value.data.data) setPlans(plansRes.value.data.data);
      if (currentRes.status === "fulfilled" && currentRes.value.data.success && currentRes.value.data.data) setCurrent(currentRes.value.data.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectPlan = (planId: number) => { setSelectedPlanId(planId); setCouponCode(""); setCouponResult(null); setShowPurchaseModal(true); };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedPlanId) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    setValidatingCoupon(true);
    try {
      const res = await subscriptionService.validateCoupon(couponCode, price);
      if (res.data.success && res.data.data) {
        setCouponResult(res.data.data);
        if (res.data.data.isValid) {
          toast.success(language === "tr" ? "Kupon geçerli!" : "Coupon valid!");
        } else {
          toast.error(res.data.data.message);
        }
      }
    } catch { toast.error(language === "tr" ? "Kupon doğrulanamadı" : "Could not validate coupon"); }
    finally { setValidatingCoupon(false); }
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) return;
    setPurchasing(true);
    try {
      const res = await subscriptionService.purchase({ planId: selectedPlanId, isYearly, couponCode: couponCode || undefined });
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        // Kupon ile bedelsiz — ödeme iframe'i yok, direkt aktif
        if (!data.iframeUrl || data.finalPrice <= 0) {
          toast.success(language === "tr" ? "Abonelik başarıyla aktifleştirildi!" : "Subscription activated successfully!");
          setShowPurchaseModal(false);
          fetchData();
        } else {
          setIframeUrl(data.iframeUrl);
          setShowPurchaseModal(false);
          setShowPaymentModal(true);
        }
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
      }
    } catch { toast.error(language === "tr" ? "Ödeme başlatılamadı" : "Could not initialize payment"); }
    finally { setPurchasing(false); }
  };

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await subscriptionService.startTrial();
      if (res.data.success) { toast.success(language === "tr" ? "Deneme süresi başlatıldı!" : "Trial period started!"); fetchData(); }
      else { toast.error(res.data.error?.message || (language === "tr" ? "Deneme başlatılamadı" : "Could not start trial")); }
    } catch { toast.error(language === "tr" ? "Deneme başlatılamadı" : "Could not start trial"); }
    finally { setStartingTrial(false); }
  };

  const handleCancel = async () => {
    try {
      const res = await subscriptionService.cancel({ reason: cancelReason || undefined, requestRefund });
      if (res.data.success) { toast.success(language === "tr" ? "Abonelik iptal edildi" : "Subscription cancelled"); setShowCancelModal(false); fetchData(); }
      else { toast.error(res.data.error?.message || (language === "tr" ? "İptal başarısız" : "Cancellation failed")); }
    } catch { toast.error(language === "tr" ? "İptal başarısız" : "Cancellation failed"); }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-3 p-16 ${isDark ? "text-white/40" : "text-gray-400"}`}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        {t.loading}
      </div>
    );
  }

  const daysLeft = current ? getDaysLeft(current.isTrialPeriod ? current.trialEndDate : current.endDate) : 0;

  return (
    <div className={`space-y-8 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.subtitle}</p>
      </div>

      {/* ─── CURRENT PLAN CARD ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {current ? (
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.currentPlan}</p>
                <p className="mt-1 text-2xl font-bold">{translatePlanName(current.planName, t.planNames)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    current.isCancelled
                      ? "border-red-500/20 bg-red-500/10 text-red-400"
                      : current.isTrialPeriod
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${current.isCancelled ? "bg-red-400" : current.isTrialPeriod ? "bg-blue-400" : "bg-emerald-400"}`} />
                    {current.isCancelled ? t.cancelled : current.isTrialPeriod ? t.trial : t.active}
                  </span>

                  {/* Days left */}
                  {!current.isCancelled && (
                    <span className={`rounded-full border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-2.5 py-1 text-[11px] ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      {daysLeft} {t.daysLeft}
                    </span>
                  )}

                  {/* Date */}
                  <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-300"}`}>
                    {current.isTrialPeriod ? t.trialEndsOn : t.expiresOn}: {formatDate(current.isTrialPeriod ? current.trialEndDate : current.endDate, language)}
                  </span>
                </div>
                {current.priceSold > 0 && (
                  <p className={`mt-2 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>₺{fmt(current.priceSold, language)}</p>
                )}
              </div>

              {!current.isCancelled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  {t.cancelSubscription}
                </button>
              )}
            </div>

            {/* Progress bar for days */}
            {!current.isCancelled && (
              <div className="mt-4">
                <div className={`h-1.5 w-full rounded-full ${isDark ? "bg-white/[0.06]" : "bg-white"}`}>
                  <div
                    className={`h-full rounded-full transition-all ${current.isTrialPeriod ? "bg-blue-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(5, Math.min(100, (daysLeft / (current.isTrialPeriod ? 3 : 30)) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No subscription */
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <svg className="text-blue-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.noPlan}</p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noPlanDesc}</p>
            <button
              onClick={handleStartTrial}
              disabled={startingTrial}
              className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-blue-900/30 transition-all hover:shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
            >
              {startingTrial ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t.startingTrial}</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>{t.startTrial}</>
              )}
            </button>
            <p className="mt-2 text-xs text-white/25">{t.trialDesc}</p>
          </div>
        )}
      </div>

      {/* ─── BILLING TOGGLE ─── */}
      <div className="flex items-center justify-center gap-4">
        <span className={`min-w-[60px] text-right text-sm font-medium transition ${!isYearly ? "text-white" : "text-white/30"}`}>{t.monthly}</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative h-7 w-14 shrink-0 rounded-full transition-all ${isYearly ? "bg-emerald-500" : "bg-white/15"}`}
        >
          <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all ${isYearly ? "left-7" : "left-0.5"}`} />
        </button>
        <span className={`min-w-[60px] text-sm font-medium transition ${isYearly ? "text-white" : "text-white/30"}`}>
          {t.yearly}
        </span>
      </div>
      {isYearly && (
        <div className="flex justify-center -mt-4">
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{t.saveYearly}</span>
        </div>
      )}

      {/* ─── PLANS GRID ─── */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = current?.planName === plan.name && !current?.isCancelled;
          const isMiddle = plans.length >= 3 && idx === 1;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
                isCurrent
                  ? "border-emerald-500/30 bg-emerald-500/[0.04] shadow-[0_0_30px_rgba(16,185,129,0.08)]"
                  : isMiddle
                    ? "border-purple-500/30 bg-purple-500/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.08)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
              }`}
            >
              {/* Badges */}
              {isCurrent && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold ${isDark ? "text-white" : "text-gray-900"} shadow`}>
                  {t.currentBadge}
                </span>
              )}
              {isMiddle && !isCurrent && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-0.5 text-[10px] font-bold ${isDark ? "text-white" : "text-gray-900"} shadow`}>
                  {t.popular}
                </span>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-bold">{translatePlanName(plan.name, t.planNames)}</h3>
              {plan.description && <p className={`mt-1 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{plan.description}</p>}

              {/* Price */}
              <div className="mt-4">
                <span className="text-4xl font-extrabold">₺{fmt(price, language)}</span>
                <span className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{isYearly ? t.perYear : t.perMonth}</span>
              </div>

              {/* Features */}
              <div className="mt-6 flex-1 space-y-3">
                <FeatureRow label={t.maxStaff} value={plan.maxStaffCount === 0 ? t.unlimited : String(plan.maxStaffCount)} enabled isDark={isDark} />
                <FeatureRow label={t.maxBranch} value={plan.maxBranchCount === 0 ? t.unlimited : String(plan.maxBranchCount)} enabled isDark={isDark} />
                <FeatureRow label={t.sms} value={plan.hasSmsIntegration ? (idx === 0 ? t.free_tag : t.yes) : t.no} enabled={plan.hasSmsIntegration} isDark={isDark} />
                <FeatureRow label={t.whatsapp} value={plan.hasWhatsappIntegration ? t.yes : t.no} enabled={plan.hasWhatsappIntegration} isDark={isDark} />
                <FeatureRow label={t.socialMedia} value={plan.hasSocialMediaIntegration ? t.yes : t.no} enabled={plan.hasSocialMediaIntegration} isDark={isDark} />
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
                className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition-all ${
                  isCurrent
                    ? "border border-emerald-500/30 bg-transparent text-emerald-400 cursor-not-allowed"
                    : isMiddle
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gradient-to-r from-[#00a651] to-[#00c853] text-white shadow-lg shadow-green-900/30 hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isCurrent ? t.currentBadge : t.select}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══ PURCHASE MODAL ═══ */}
      <Modal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title={t.purchase} maxWidth="max-w-md">
        <div className="space-y-5">
          {selectedPlanId && (() => {
            const plan = plans.find(p => p.id === selectedPlanId);
            if (!plan) return null;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div className={`flex items-center justify-between rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4`}>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{translatePlanName(plan.name, t.planNames)}</p>
                  <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{isYearly ? t.yearly : t.monthly}</p>
                </div>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt(price, language)}</p>
              </div>
            );
          })()}

          {/* Coupon */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.couponCode}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                placeholder={t.couponPlaceholder}
                className={`flex-1 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} font-mono tracking-wider ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || validatingCoupon}
                className={`shrink-0 rounded-xl ${isDark ? "bg-white/10" : "bg-gray-100"} px-4 py-2.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition hover:bg-white/15 disabled:opacity-40`}
              >
                {validatingCoupon ? t.validating : t.applyCoupon}
              </button>
            </div>

            {/* Coupon result */}
            {couponResult && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                couponResult.isValid
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border border-red-500/20 bg-red-500/10 text-red-400"
              }`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {couponResult.isValid
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                </svg>
                {couponResult.message}
              </div>
            )}
          </div>

          {/* Price breakdown with coupon */}
          {couponResult?.isValid && selectedPlanId && (() => {
            const plan = plans.find(p => p.id === selectedPlanId);
            if (!plan) return null;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const discount = couponResult.discountAmount || 0;
            const final_ = Math.max(0, price - discount);
            return (
              <div className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-2`}>
                <div className={`flex justify-between text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <span>{translatePlanName(plan.name, t.planNames)} ({isYearly ? t.yearly : t.monthly})</span>
                  <span>₺{fmt(price, language)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>{t.discount}</span>
                  <span>-₺{fmt(discount, language)}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-2 flex justify-between">
                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.finalPrice}</span>
                  <span className={`text-lg font-bold ${final_ <= 0 ? "text-emerald-400" : "text-white"}`}>
                    {final_ <= 0 ? t.free : `₺${fmt(final_, language)}`}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-1">
            {(() => {
              const plan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;
              const price = plan ? (isYearly ? plan.yearlyPrice : plan.monthlyPrice) : 0;
              const discount = couponResult?.isValid ? (couponResult.discountAmount || 0) : 0;
              const final_ = Math.max(0, price - discount);
              const isFree = couponResult?.isValid && final_ <= 0;

              return (
                <button onClick={handlePurchase} disabled={purchasing}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg transition disabled:opacity-50 ${
                    isFree
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-900/30"
                      : "bg-gradient-to-r from-[#00a651] to-[#00c853] shadow-green-900/30"
                  }`}>
                  {purchasing ? t.purchasing : isFree ? t.activateNow : t.purchase}
                </button>
              );
            })()}
            <button onClick={() => setShowPurchaseModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{t.cancel}</button>
          </div>
        </div>
      </Modal>

      {/* ═══ PAYMENT IFRAME MODAL ═══ */}
      <Modal open={showPaymentModal} onClose={() => { setShowPaymentModal(false); setIframeUrl(null); fetchData(); }} title={t.paymentModal} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.paymentProcessing}</p>
          {iframeUrl ? (
            <div className={`overflow-hidden rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <iframe src={iframeUrl} width="100%" height="460" frameBorder="0" className="bg-white" allow="payment" />
            </div>
          ) : (
            <div className={`flex h-[460px] items-center justify-center gap-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              {t.paymentLoading}
            </div>
          )}
        </div>
      </Modal>

      {/* ═══ CANCEL MODAL ═══ */}
      <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)} title={t.cancelSubscription} maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
            <svg className="inline mr-1.5 -mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            {t.cancelWarning}
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.cancelReason}</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder={t.cancelReasonPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25 resize-none`}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${requestRefund ? "border-red-500 bg-red-500" : "border-white/20 bg-white/5"}`}>
              {requestRefund && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <input type="checkbox" checked={requestRefund} onChange={(e) => setRequestRefund(e.target.checked)} className="hidden" />
            <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>{t.requestRefund}</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button onClick={handleCancel}
              className={`flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} transition hover:bg-red-500`}>
              {t.cancelConfirm}
            </button>
            <button onClick={() => setShowCancelModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{t.cancel}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══ Feature Row ═══ */
function FeatureRow({ label, value, enabled, isDark }: { label: string; value: string; enabled: boolean; isDark: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className={enabled ? "text-emerald-400" : "text-white/15"} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {enabled ? <polyline points="20 6 9 17 4 12" /> : <line x1="18" y1="6" x2="6" y2="18" />}
        </svg>
        <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{label}</span>
      </div>
      <span className={`text-xs font-semibold ${enabled ? "text-white" : "text-white/20"}`}>{value}</span>
    </div>
  );
}

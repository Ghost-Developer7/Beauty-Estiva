"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionPlan, CurrentSubscription } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Subscription",
    currentPlan: "Current Plan",
    plans: "Available Plans",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "/month",
    perYear: "/year",
    features: "Features",
    maxStaff: "Max Staff",
    maxBranch: "Max Branches",
    sms: "SMS Integration",
    ai: "AI Features",
    yes: "Yes",
    no: "No",
    select: "Select Plan",
    currentBadge: "Current",
    couponCode: "Coupon Code",
    couponPlaceholder: "Enter coupon code...",
    applyCoupon: "Apply",
    purchase: "Pay Now",
    purchasing: "Processing...",
    startTrial: "Start 7-Day Free Trial",
    startingTrial: "Starting...",
    cancel: "Cancel",
    cancelSubscription: "Cancel Subscription",
    cancelReason: "Cancellation Reason",
    cancelConfirm: "Cancel Subscription",
    requestRefund: "Request Refund",
    paymentModal: "Payment",
    paymentProcessing: "Complete your payment in the form below.",
    paymentLoading: "Loading payment form...",
    active: "Active",
    trial: "Trial",
    cancelled: "Cancelled",
    expired: "Expired",
    expiresOn: "Expires",
    trialEndsOn: "Trial ends",
    noPlan: "No active subscription",
    noPlanDesc: "Choose a plan to get started.",
    loading: "Loading...",
    savedYearly: "Save with yearly!",
    unlimited: "Unlimited",
  },
  tr: {
    title: "Abonelik",
    currentPlan: "Mevcut Plan",
    plans: "Mevcut Planlar",
    monthly: "Aylık",
    yearly: "Yıllık",
    perMonth: "/ay",
    perYear: "/yıl",
    features: "Özellikler",
    maxStaff: "Maks Personel",
    maxBranch: "Maks Şube",
    sms: "SMS Entegrasyonu",
    ai: "AI Özellikleri",
    yes: "Var",
    no: "Yok",
    select: "Planı Seç",
    currentBadge: "Mevcut",
    couponCode: "Kupon Kodu",
    couponPlaceholder: "Kupon kodu girin...",
    applyCoupon: "Uygula",
    purchase: "Ödeme Yap",
    purchasing: "İşleniyor...",
    startTrial: "7 Günlük Ücretsiz Deneme Başlat",
    startingTrial: "Başlatılıyor...",
    cancel: "İptal",
    cancelSubscription: "Aboneliği İptal Et",
    cancelReason: "İptal Nedeni",
    cancelConfirm: "Aboneliği İptal Et",
    requestRefund: "İade Talep Et",
    paymentModal: "Ödeme",
    paymentProcessing: "Aşağıdaki formdan ödemenizi tamamlayın.",
    paymentLoading: "Ödeme formu yükleniyor...",
    active: "Aktif",
    trial: "Deneme",
    cancelled: "İptal Edildi",
    expired: "Süresi Doldu",
    expiresOn: "Bitiş Tarihi",
    trialEndsOn: "Deneme Bitiş",
    noPlan: "Aktif abonelik yok",
    noPlanDesc: "Başlamak için bir plan seçin.",
    loading: "Yükleniyor...",
    savedYearly: "Yıllık ile tasarruf edin!",
    unlimited: "Sınırsız",
  },
};

export default function SubscriptionScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  // Purchase flow
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // PayTR iframe
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Cancel
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [requestRefund, setRequestRefund] = useState(false);

  // Trial
  const [startingTrial, setStartingTrial] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.allSettled([
        subscriptionService.listPlans(),
        subscriptionService.getCurrent(),
      ]);
      if (plansRes.status === "fulfilled" && plansRes.value.data.success && plansRes.value.data.data) {
        setPlans(plansRes.value.data.data);
      }
      if (currentRes.status === "fulfilled" && currentRes.value.data.success && currentRes.value.data.data) {
        setCurrent(currentRes.value.data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlanId(planId);
    setCouponCode("");
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) return;
    setPurchasing(true);
    try {
      const res = await subscriptionService.purchase({
        planId: selectedPlanId,
        isYearly,
        couponCode: couponCode || undefined,
      });
      if (res.data.success && res.data.data) {
        const { iframeUrl: url } = res.data.data;
        setIframeUrl(url);
        setShowPurchaseModal(false);
        setShowPaymentModal(true);
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
      }
    } catch {
      toast.error(language === "tr" ? "Ödeme başlatılamadı" : "Could not initialize payment");
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await subscriptionService.startTrial();
      if (res.data.success) {
        toast.success(language === "tr" ? "Deneme süresi başlatıldı!" : "Trial period started!");
        fetchData();
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Deneme başlatılamadı" : "Could not start trial"));
      }
    } catch {
      toast.error(language === "tr" ? "Deneme başlatılamadı" : "Could not start trial");
    } finally {
      setStartingTrial(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await subscriptionService.cancel({
        reason: cancelReason || undefined,
        requestRefund,
      });
      if (res.data.success) {
        toast.success(language === "tr" ? "Abonelik iptal edildi" : "Subscription cancelled");
        setShowCancelModal(false);
        fetchData();
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "İptal başarısız" : "Cancellation failed"));
      }
    } catch {
      toast.error(language === "tr" ? "İptal başarısız" : "Cancellation failed");
    }
  };

  const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (loading) {
    return <div className="p-8 text-center text-white/60">{text.loading}</div>;
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Estiva</p>
        <h1 className="mt-3 text-3xl font-semibold">{text.title}</h1>
      </div>

      {/* Current Plan */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(4,2,12,0.6)]">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-4">{text.currentPlan}</h2>
        {current ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold">{current.planName}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  current.isCancelled
                    ? "bg-red-500/10 text-red-400"
                    : current.isTrialPeriod
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {current.isCancelled ? text.cancelled : current.isTrialPeriod ? text.trial : text.active}
                </span>
                <span className="text-sm text-white/60">
                  {current.isTrialPeriod
                    ? `${text.trialEndsOn}: ${formatDate(current.trialEndDate)}`
                    : `${text.expiresOn}: ${formatDate(current.endDate)}`}
                </span>
              </div>
              {current.priceSold > 0 && (
                <p className="mt-1 text-sm text-white/50">{fmt(current.priceSold)} TRY</p>
              )}
            </div>
            {!current.isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                {text.cancelSubscription}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-lg text-white/60">{text.noPlan}</p>
            <p className="text-sm text-white/40">{text.noPlanDesc}</p>
            <button
              onClick={handleStartTrial}
              disabled={startingTrial}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {startingTrial ? text.startingTrial : text.startTrial}
            </button>
          </div>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isYearly ? "text-white" : "text-white/40"}`}>
          {text.monthly}
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative h-7 w-14 rounded-full transition ${isYearly ? "bg-emerald-500" : "bg-white/20"}`}
        >
          <div
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
              isYearly ? "left-7" : "left-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isYearly ? "text-white" : "text-white/40"}`}>
          {text.yearly}
          <span className="ml-2 text-xs text-emerald-400">{text.savedYearly}</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = current?.planName === plan.name && !current?.isCancelled;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-6 shadow-[0_20px_60px_rgba(4,2,12,0.6)] transition ${
                isCurrent
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {text.currentBadge}
                </span>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>
              {plan.description && (
                <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              )}

              <div className="mt-4">
                <span className="text-3xl font-bold">{fmt(price)}</span>
                <span className="text-sm text-white/50"> TRY{isYearly ? text.perYear : text.perMonth}</span>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/60">{text.maxStaff}</span>
                  <span className="font-medium">{plan.maxStaffCount === 0 ? text.unlimited : plan.maxStaffCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/60">{text.maxBranch}</span>
                  <span className="font-medium">{plan.maxBranchCount === 0 ? text.unlimited : plan.maxBranchCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/60">{text.sms}</span>
                  <span className={`font-medium ${plan.hasSmsIntegration ? "text-emerald-400" : "text-white/30"}`}>
                    {plan.hasSmsIntegration ? text.yes : text.no}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">{text.ai}</span>
                  <span className={`font-medium ${plan.hasAiFeatures ? "text-emerald-400" : "text-white/30"}`}>
                    {plan.hasAiFeatures ? text.yes : text.no}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  isCurrent
                    ? "border border-emerald-500/30 bg-transparent text-emerald-400 cursor-not-allowed"
                    : "bg-[#00a651] text-white hover:bg-[#008f45]"
                }`}
              >
                {isCurrent ? text.currentBadge : text.select}
              </button>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal (coupon + confirm) */}
      <Modal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title={text.purchase}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {/* Selected plan info */}
          {selectedPlanId && (() => {
            const plan = plans.find((p) => p.id === selectedPlanId);
            if (!plan) return null;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{plan.name}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {fmt(price)} TRY
                  <span className="text-sm text-white/50">{isYearly ? text.perYear : text.perMonth}</span>
                </p>
              </div>
            );
          })()}

          {/* Coupon */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.couponCode}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={text.couponPlaceholder}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50"
            >
              {purchasing ? text.purchasing : text.purchase}
            </button>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              {text.cancel}
            </button>
          </div>
        </div>
      </Modal>

      {/* PayTR IFRAME Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setIframeUrl(null);
          fetchData(); // Refresh data after payment modal closes
        }}
        title={text.paymentModal}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">{text.paymentProcessing}</p>
          {iframeUrl ? (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <iframe
                src={iframeUrl}
                width="100%"
                height="460"
                frameBorder="0"
                className="bg-white"
                allow="payment"
              />
            </div>
          ) : (
            <div className="flex h-[460px] items-center justify-center text-white/40">
              {text.paymentLoading}
            </div>
          )}
        </div>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={text.cancelSubscription}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.cancelReason}</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={requestRefund}
              onChange={(e) => setRequestRefund(e.target.checked)}
              className="rounded"
            />
            {text.requestRefund}
          </label>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
            >
              {text.cancelConfirm}
            </button>
            <button
              onClick={() => setShowCancelModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              {text.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

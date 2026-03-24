"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { subscriptionService } from "@/services/subscriptionService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Abonelik kontrolü yapan guard bileşeni.
 * - /dashboard/subscription sayfasına her zaman erişim izni verir (plan satın alabilmesi için)
 * - Diğer dashboard sayfalarında aktif abonelik yoksa engeller ve yönlendirir
 */

const ALLOWED_WITHOUT_SUBSCRIPTION = [
  "/dashboard/subscription",
  "/dashboard/settings",
];

const copy = {
  en: {
    title: "Subscription Required",
    desc: "Your subscription has expired or you don't have an active plan. Please choose a plan to continue using the platform.",
    cta: "View Plans",
    loading: "Checking subscription...",
  },
  tr: {
    title: "Abonelik Gerekli",
    desc: "Aboneliğiniz sona erdi veya aktif bir planınız yok. Platformu kullanmaya devam etmek için lütfen bir plan seçin.",
    cta: "Planları Görüntüle",
    loading: "Abonelik kontrol ediliyor...",
  },
};

export default function SubscriptionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = copy[language];

  const [status, setStatus] = useState<"loading" | "active" | "inactive">("loading");

  // SuperAdmin her zaman erişebilir
  const isSuperAdmin = user?.roles?.includes("SuperAdmin") ?? false;

  const checkSubscription = useCallback(async () => {
    if (isSuperAdmin) { setStatus("active"); return; }
    try {
      const res = await subscriptionService.getStatus();
      if (res.data.success && res.data.data) {
        setStatus(res.data.data.isActive ? "active" : "inactive");
      } else {
        setStatus("inactive");
      }
    } catch {
      // API hatası durumunda erişimi engelleme — ağ sorunu olabilir
      setStatus("active");
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    checkSubscription();
  }, [authLoading, isAuthenticated, checkSubscription]);

  // SuperAdmin veya izin verilen sayfalar
  if (isSuperAdmin) return <>{children}</>;
  const isAllowedPath = ALLOWED_WITHOUT_SUBSCRIPTION.some(p => pathname.startsWith(p));
  if (isAllowedPath) return <>{children}</>;

  // Auth hala yükleniyor
  if (authLoading) return null;

  // Abonelik kontrolü yükleniyor
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 p-16 text-white/40">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        {t.loading}
      </div>
    );
  }

  // Abonelik aktif
  if (status === "active") return <>{children}</>;

  // Abonelik yok — engelle
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20">
          <svg className="text-amber-400" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <p className="mt-2 text-sm text-white/50">{t.desc}</p>
        <button
          onClick={() => router.push("/dashboard/subscription")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /></svg>
          {t.cta}
        </button>
      </div>
    </div>
  );
}

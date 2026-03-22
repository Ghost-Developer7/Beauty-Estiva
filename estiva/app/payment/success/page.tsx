"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  en: {
    title: "Payment Successful",
    message: "Your subscription payment has been processed successfully. You can now use all features.",
    dashboard: "Go to Dashboard",
    subscription: "View Subscription",
  },
  tr: {
    title: "Ödeme Başarılı",
    message: "Abonelik ödemeniz başarıyla işlendi. Artık tüm özellikleri kullanabilirsiniz.",
    dashboard: "Panele Git",
    subscription: "Aboneliği Görüntüle",
  },
};

export default function PaymentSuccessPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0614] text-white">
      <div className="mx-4 max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <p className="mt-3 text-sm text-white/60">{text.message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#00a651] px-6 py-3 text-sm font-semibold text-white hover:bg-[#008f45] transition"
          >
            {text.dashboard}
          </Link>
          <Link
            href="/dashboard/subscription"
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/5 transition"
          >
            {text.subscription}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  en: {
    title: "Payment Failed",
    message: "Your payment could not be processed. Please try again or contact support.",
    retry: "Try Again",
    dashboard: "Go to Dashboard",
  },
  tr: {
    title: "Ödeme Başarısız",
    message: "Ödemeniz işlenemedi. Lütfen tekrar deneyin veya destek ile iletişime geçin.",
    retry: "Tekrar Dene",
    dashboard: "Panele Git",
  },
};

export default function PaymentFailPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0614] text-white">
      <div className="mx-4 max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <p className="mt-3 text-sm text-white/60">{text.message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard/subscription"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition"
          >
            {text.retry}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/5 transition"
          >
            {text.dashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}

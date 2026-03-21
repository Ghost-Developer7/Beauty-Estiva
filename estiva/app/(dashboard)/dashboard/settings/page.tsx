"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  en: {
    title: "Settings",
    text: "Configure branding, notifications, and workspace preferences here soon.",
  },
  tr: {
    title: "Ayarlar",
    text: "Marka, bildirimler ve çalışma alanı tercihlerini yakında buradan yapılandırabileceksiniz.",
  },
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-semibold">{text.title}</h1>
      <p className="text-white/70">{text.text}</p>
    </div>
  );
}

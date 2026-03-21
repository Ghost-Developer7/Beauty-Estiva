"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  en: {
    title: "Reports",
    text: "Detailed reporting modules will live here. Use the sidebar to explore other finished screens.",
  },
  tr: {
    title: "Raporlar",
    text: "Detaylı raporlama modülleri burada yer alacak. Tamamlanan diğer ekranları keşfetmek için kenar çubuğunu kullanın.",
  },
};

export default function ReportsPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-semibold">{text.title}</h1>
      <p className="text-white/70">{text.text}</p>
    </div>
  );
}

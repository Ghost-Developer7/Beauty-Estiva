"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseClasses = isDark
    ? "border-white/30 bg-white/10 text-white hover:border-white/60"
    : "border-[#d0c0f5] bg-white text-[#3a2a6a] hover:border-[#b59cf2]";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Change language"
      className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition ${baseClasses}`}
    >
      {language === "en" ? "EN" : "TR"}
    </button>
  );
}

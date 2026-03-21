"use client";

import { IconCalendar, IconSettings, IconChevronDown } from "@/components/dashboard/icons";
import { useState } from "react";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  en: {
    today: "Today",
    search: "Search clients, rituals, or invoices...",
    role: "Estiva Glow House",
  },
  tr: {
    today: "Bugün",
    search: "Müşteri, ritüel veya fatura ara...",
    role: "Estiva Glow House",
  },
};

export default function Topbar() {
  const [search, setSearch] = useState("");
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-white backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <button className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
          <IconCalendar />
          {text.today}
        </button>
        <div className="flex flex-1 items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text.search}
            className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 text-white/70">
          <LanguageToggle />
          <ThemeToggle />

          <button className="rounded-full border border-white/15 p-2 hover:text-white">
            <IconSettings />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer group">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ffd1dc] to-[#f3a4ff] shadow-lg shadow-pink-500/20" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#130628] bg-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white group-hover:text-pink-100 transition-colors leading-tight">Gökhan Mülayim</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium leading-tight">
                {text.role}
              </span>
            </div>
            <div className="ml-1 text-white/20 group-hover:text-white/50 transition-colors">
              <IconChevronDown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

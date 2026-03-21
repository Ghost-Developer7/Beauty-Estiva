"use client";

import { Fragment } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { IconSettings } from "@/components/dashboard/icons";

const stylists = [
  { name: "Nilüfer Ayaz", color: "#ef4444" }, // Red
  { name: "Tarık Ayaz", color: "#3b82f6" },   // Blue
];

const hours = Array.from({ length: 16 }, (_, index) => {
  const hour = 15 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

const copy = {
  en: {
    date: "29 Jan 2026 Thursday",
    today: "Today",
    dailyView: "Daily view",
    newBooking: "New appointment",
    filters: "Filter",
  },
  tr: {
    date: "29 Ocak 2026 Perşembe",
    today: "Bugün",
    dailyView: "Günlük görünüm",
    newBooking: "Yeni adisyon",
    filters: "Filtrele",
  },
};

export default function CalendarScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 hover:bg-white/10">
            {"<"}
          </button>
          <div className="flex h-8 min-w-[200px] items-center justify-between rounded border border-white/10 bg-white px-3 text-sm font-medium text-gray-900">
            <span>{text.date}</span>
            <span>v</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 hover:bg-white/10">
            {">"}
          </button>
          <button className="h-8 rounded border border-white/10 bg-white/5 px-4 text-sm font-medium hover:bg-white/10">
            {text.today}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 hover:bg-white/10">
            <IconSettings />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 hover:bg-white/10">
            ↻
          </button>
          <div className="flex h-8 min-w-[140px] items-center justify-between rounded border border-white/10 bg-white px-3 text-sm font-medium text-gray-400">
            <span>Nilüfer Ayaz, Tarık...</span>
            <span>🔍</span>
          </div>
          <div className="flex h-8 min-w-[120px] items-center justify-between rounded border border-white/10 bg-white px-3 text-sm font-medium text-gray-400">
            <span>{text.dailyView}</span>
            <span>👁</span>
          </div>
          <button className="h-8 rounded bg-[#2ecc71] px-4 text-sm font-semibold text-white hover:bg-[#27ae60]">
            + {text.newBooking}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#fbf8ea]"> {/* Beige tint from screenshot */}
        {/* Using a very light beige bg '#fbf8ea' to mimic screenshot while keeping headers? 
             Actually user asked to keep "dark theme" for UI but "layout" from screenshot. 
             If I use light beige bg it breaks the dark theme. 
             But the screenshot is VERY specifically light beige grid. 
             
             Let's try to interpret "structure" vs "theme".
             Structure = Left time column, top stylist columns.
             Theme = Dark background.
             
             So I will use dark background for the grid.
         */}

      </div>

      {/* Re-thinking implementation: 
          The user showed a screenshot of a light calendar but said "stay faithful to interface theme".
          So I should build the STRUCTURE (time slots left, columns right) but use DARK colors.
      */}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0614]">
        {/* Stylist Headers */}
        <div className="grid grid-cols-[60px_1fr_1fr]">
          <div className="border-b border-r border-white/10 bg-white/5"></div> {/* Top left corner */}
          {stylists.map((stylist) => (
            <div
              key={stylist.name}
              className="flex h-10 items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: stylist.color }}
            >
              {stylist.name}
            </div>
          ))}
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-[60px_1fr_1fr]">
          {/* Time Column */}
          <div className="border-r border-white/10 bg-white/5 text-xs text-white/50">
            {hours.map((time, i) => (
              <div key={time} className="flex h-12 items-center justify-center border-b border-white/5">
                {time}
              </div>
            ))}
          </div>

          {/* Columns for Stylists */}
          {stylists.map((stylist) => (
            <div key={stylist.name} className="relative border-r border-white/10 border-b border-white/10">
              {hours.map((time, i) => (
                <div key={time} className="h-12 border-b border-white/5 border-dashed"></div>
              ))}

              {/* Mock Events */}
              {/* No events in screenshot, keeping clean grid */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

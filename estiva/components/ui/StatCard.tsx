"use client";

import { useState, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  dotColor?: string;
  icon?: ReactNode;
  gradient?: string;
  tooltip?: string;
}

export default function StatCard({ label, value, sub, color, dotColor, tooltip }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showTip, setShowTip] = useState(false);

  return (
    <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-3`}>
      <div className="flex items-center gap-1.5">
        {dotColor && <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />}
        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${isDark ? "bg-white/10 text-white/30 hover:bg-white/20 hover:text-white/60" : "bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600"} transition`}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            {showTip && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg border px-3 py-2 text-[11px] leading-relaxed shadow-xl z-50 ${isDark ? "border-white/10 bg-[#1a1a2e] text-white/80" : "border-gray-200 bg-white text-gray-600"}`}>
                {tooltip}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-px border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] ${isDark ? "border-t-[#1a1a2e]" : "border-t-white"}`} />
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{sub}</p>}
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { InfoTooltip } from "@/components/ui/Tooltip";

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

  return (
    <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-3`}>
      <div className="flex items-center gap-1.5">
        {dotColor && <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />}
        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <p className="mt-1 text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{sub}</p>}
    </div>
  );
}

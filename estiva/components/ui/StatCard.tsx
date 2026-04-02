"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { InfoTooltip } from "@/components/ui/Tooltip";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /** Tailwind bg class for the glow + icon box, e.g. "bg-violet-500" */
  gradient?: string;
  /** Tailwind text-color class for the icon, e.g. "text-violet-400" */
  iconColor?: string;
  icon?: ReactNode;
  tooltip?: string;
  /** Optional: ratio bar (0–100) shown at bottom */
  barPct?: number;
  /** Tailwind bg class for the bar fill, e.g. "bg-blue-400" */
  barColor?: string;
  /** Inline colour override for the value text (hex / css color) */
  valueColor?: string;
  /** If provided, the card becomes a link */
  href?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  gradient = "bg-violet-500",
  iconColor = "text-violet-400",
  icon,
  tooltip,
  barPct,
  barColor = "bg-violet-400",
  valueColor,
  href,
}: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const inner = (
    <>
      {/* Ambient glow */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:h-32 group-hover:w-32 group-hover:opacity-40 ${gradient}`}
      />
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative flex items-start gap-3">
        {/* Icon box — solid gradient background, white icon */}
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 text-white ${gradient}`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Label + tooltip */}
          <div className="flex items-center gap-1.5">
            <p className={`text-[11px] font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {label}
            </p>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>

          {/* Value */}
          <p
            className={`mt-0.5 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            style={valueColor ? { color: valueColor } : undefined}
          >
            {value}
          </p>

          {/* Sub text */}
          {sub && (
            <p className={`mt-0.5 text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>
              {sub}
            </p>
          )}

          {/* Progress bar */}
          {barPct !== undefined && (
            <div className="mt-2.5">
              <div
                className={`h-1 w-full overflow-hidden rounded-full ${isDark ? "bg-white/[0.07]" : "bg-gray-200"}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.min(barPct, 100)}%`, opacity: 0.8 }}
                />
              </div>
              <p className={`mt-1 text-[10px] tabular-nums ${isDark ? "text-white/20" : "text-gray-400"}`}>
                {Math.round(barPct)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const baseClass = `group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
    ${isDark
      ? "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]"
      : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"}
    ${href ? "cursor-pointer" : ""}`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {inner}
      </Link>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}

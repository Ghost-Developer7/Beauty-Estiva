"use client";

import { useTheme } from "@/contexts/ThemeContext";

type ButtonProps = {
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
};

export default function Button({
  type = "button",
  children,
  className = "",
}: ButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseClasses = isDark
    ? "border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/60"
    : "border border-[#c9b4ff] bg-[#3b2268] text-white hover:bg-[#2b174e] hover:border-[#b49af2]";

  return (
    <button
      type={type}
      className={`w-full rounded-2xl px-4 py-3 text-base font-semibold transition shadow-sm ${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
}

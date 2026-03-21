"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const icon = isDark ? "\u263D" : "\u2600";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-base transition ${
        isDark
          ? "border-white/30 bg-white/10 text-white hover:border-white/60"
          : "border-[#d0c0f5] bg-white text-[#3a2a6a] hover:border-[#b398ef]"
      }`}
    >
      <span>{icon}</span>
    </button>
  );
}

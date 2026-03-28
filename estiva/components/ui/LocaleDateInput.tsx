"use client";

import { useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocaleDateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isDark?: boolean;
}

/**
 * Drop-in replacement for <input type="date" /> and <input type="datetime-local" />
 * that displays the date in the correct locale format (TR: gg.aa.yyyy, EN: mm/dd/yyyy)
 * regardless of the browser's OS locale.
 *
 * Clicking anywhere on the input opens the native date picker.
 * Manual typing is also supported.
 */
export function LocaleDateInput({
  type = "date",
  value,
  className = "",
  isDark = true,
  style,
  ...rest
}: LocaleDateInputProps) {
  const { language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const displayText = useMemo(() => {
    const v = (value as string) || "";
    if (!v) {
      if (type === "datetime-local") {
        return language === "tr" ? "gg.aa.yyyy --:--" : "mm/dd/yyyy --:--";
      }
      return language === "tr" ? "gg.aa.yyyy" : "mm/dd/yyyy";
    }

    try {
      if (type === "datetime-local" && v.includes("T")) {
        const [datePart, timePart] = v.split("T");
        const [y, m, d] = datePart.split("-");
        const dateStr =
          language === "tr" ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
        return `${dateStr} ${timePart}`;
      }
      const parts = v.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return language === "tr" ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
      }
      return v;
    } catch {
      return v;
    }
  }, [value, language, type]);

  const hasValue = !!(value as string);

  const handleOverlayClick = () => {
    const input = inputRef.current;
    if (!input) return;
    // Try showPicker (modern browsers)
    try {
      input.showPicker();
    } catch {
      // Fallback: just focus the input
      input.focus();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type as string}
        value={value}
        className={`${className} locale-date-input`}
        style={style}
        {...rest}
      />
      <span
        onClick={handleOverlayClick}
        className={`absolute inset-y-0 left-0 right-8 flex items-center px-3 text-sm cursor-pointer ${
          hasValue
            ? isDark
              ? "text-white"
              : "text-gray-900"
            : isDark
              ? "text-white/30"
              : "text-gray-400"
        }`}
      >
        {displayText}
      </span>
    </div>
  );
}

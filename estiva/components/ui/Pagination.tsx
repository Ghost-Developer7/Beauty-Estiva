"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const copy = {
  en: {
    showing: "Showing",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
  },
  tr: {
    showing: "Gösterilen",
    of: "/",
    results: "sonuç",
    previous: "Önceki",
    next: "Sonraki",
  },
};

export default function Pagination({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = copy[language];
  const isDark = theme === "dark";

  if (totalCount === 0) return null;

  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (pageNumber > 3) pages.push("...");

      const rangeStart = Math.max(2, pageNumber - 1);
      const rangeEnd = Math.min(totalPages - 1, pageNumber + 1);

      for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

      if (pageNumber < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-2 border-t ${
      isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-gray-50"
    }`}>
      {/* Info */}
      <div className={`flex items-center gap-3 text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>
        <span>
          {t.showing} {start}-{end} {t.of} {totalCount} {t.results}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={`rounded-lg border px-2 py-1 text-xs focus:outline-none transition cursor-pointer ${
            isDark
              ? "border-white/[0.08] bg-white/[0.03] text-white/60 focus:border-white/20"
              : "border-gray-200 bg-white text-gray-700 focus:border-gray-400"
          }`}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size} className={isDark ? "bg-[#1a1a2e] text-white" : "bg-white text-gray-700"}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white disabled:hover:bg-transparent"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:hover:bg-white"
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="hidden sm:inline">{t.previous}</span>
        </button>

        {/* Page numbers - hidden on very small screens */}
        <span className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span
              key={`dots-${i}`}
              className={`flex h-8 w-8 items-center justify-center text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                page === pageNumber
                  ? isDark
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-gray-200 text-gray-900 border border-gray-300"
                  : isDark
                    ? "text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {page}
            </button>
          )
        )}
        </span>
        {/* Mobile: show page X of Y */}
        <span className={`flex sm:hidden items-center text-xs px-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>
          {pageNumber}/{totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white disabled:hover:bg-transparent"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:hover:bg-white"
          }`}
        >
          <span className="hidden sm:inline">{t.next}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

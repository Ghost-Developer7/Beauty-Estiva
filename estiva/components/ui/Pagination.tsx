"use client";

import { useLanguage } from "@/contexts/LanguageContext";

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
    perPage: "per page",
    previous: "Previous",
    next: "Next",
  },
  tr: {
    showing: "Gosterilen",
    of: "/",
    results: "sonuc",
    perPage: "sayfa basi",
    previous: "Onceki",
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
  const t = copy[language];

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
      {/* Info */}
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>
          {t.showing} {start}-{end} {t.of} {totalCount} {t.results}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/60 focus:outline-none focus:border-white/20 transition cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size} className="bg-[#1a1a2e] text-white">
              {size} {t.perPage}
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
          className="flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
              className="flex h-8 w-8 items-center justify-center text-xs text-white/30"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                page === pageNumber
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"
              }`}
            >
              {page}
            </button>
          )
        )}
        </span>
        {/* Mobile: show page X of Y */}
        <span className="flex sm:hidden items-center text-xs text-white/40 px-2">
          {pageNumber}/{totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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

"use client";

import { useState } from "react";
import { exportToExcel, exportToPDF, type ExportColumn } from "@/lib/exportUtils";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filenamePrefix: string;
  pdfTitle: string;
}

export default function ExportButtons({ data, columns, filenamePrefix, pdfTitle }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const handleExcel = async () => {
    if (exporting || data.length === 0) return;
    setExporting("excel");
    try {
      await exportToExcel(data, columns, filenamePrefix);
    } catch (err) {
      console.error("Excel export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  const handlePDF = async () => {
    if (exporting || data.length === 0) return;
    setExporting("pdf");
    try {
      await exportToPDF(data, columns, pdfTitle, filenamePrefix);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Excel Button */}
      <button
        onClick={handleExcel}
        disabled={exporting !== null || data.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 sm:px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Excel"
      >
        {exporting === "excel" ? (
          <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-emerald-400" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )}
        <span className="hidden sm:inline">Excel</span>
      </button>

      {/* PDF Button */}
      <button
        onClick={handlePDF}
        disabled={exporting !== null || data.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 sm:px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
        title="PDF"
      >
        {exporting === "pdf" ? (
          <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-red-400" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
}

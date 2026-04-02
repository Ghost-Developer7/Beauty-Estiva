"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { financialReportService } from "@/services/financialReportService";
import type { RevenueSummary, ExpenseSummary } from "@/types/api";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import StatCard from "@/components/ui/StatCard";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Cash Report",
    loading: "Loading...",
    revenue: "Revenue",
    expenses: "Expenses",
    netProfit: "Net Profit",
    byPaymentMethod: "By Payment Method",
    byStaff: "By Staff",
    byCategory: "By Category",
    noData: "No data for this period.",
    startDate: "Start",
    endDate: "End",
    total: "Total",
  },
  tr: {
    title: "Kasa Raporu",
    loading: "Yükleniyor...",
    revenue: "Gelir",
    expenses: "Gider",
    netProfit: "Net Kar",
    byPaymentMethod: "Ödeme Yöntemine Göre",
    byStaff: "Personele Göre",
    byCategory: "Kategoriye Göre",
    noData: "Bu dönem için veri yok.",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    total: "Toplam",
  },
};

const PAYMENT_METHOD_MAP: { tr: string; en: string }[] = [
  { tr: "Nakit", en: "Cash" },
  { tr: "Kredi / Banka Kartı", en: "Credit / Debit Card" },
  { tr: "Havale / EFT", en: "Bank Transfer" },
  { tr: "Çek", en: "Check" },
  { tr: "Diğer", en: "Other" },
];

function translatePaymentLabel(label: string | null | undefined, lang: "en" | "tr"): string {
  if (!label) return "";
  const m = PAYMENT_METHOD_MAP.find(
    pm => pm.tr.toLowerCase() === label.toLowerCase() || pm.en.toLowerCase() === label.toLowerCase()
  );
  return m ? (lang === "tr" ? m.tr : m.en) : label;
}

export default function CashReportScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [expense, setExpense] = useState<ExpenseSummary | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    revenue: true,
    expense: true,
    staff: false,
    category: false,
  });

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [revRes, expRes] = await Promise.allSettled([
        financialReportService.revenue(Object.keys(params).length > 0 ? params : undefined),
        financialReportService.expense(Object.keys(params).length > 0 ? params : undefined),
      ]);

      if (revRes.status === "fulfilled" && revRes.value.data.success && revRes.value.data.data) {
        setRevenue(revRes.value.data.data);
      }
      if (expRes.status === "fulfilled" && expRes.value.data.success && expRes.value.data.data) {
        setExpense(expRes.value.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Rapor yüklenemedi" : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const netProfit = (revenue?.totalAmountInTry || 0) - (expense?.totalAmountInTry || 0);

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <div className="flex items-center gap-3">
          <LocaleDateInput value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
          <LocaleDateInput value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
        </div>
      </div>

      {loading ? (
        <div className={`p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.loading}</div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={text.revenue}
              value={`${fmt(revenue?.totalAmountInTry || 0)} ₺`}
              valueColor="#22c55e"
              gradient="bg-emerald-500"
              iconColor="text-emerald-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            />
            <StatCard
              label={text.expenses}
              value={`${fmt(expense?.totalAmountInTry || 0)} ₺`}
              valueColor="#ef4444"
              gradient="bg-red-500"
              iconColor="text-red-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
            />
            <StatCard
              label={text.netProfit}
              value={`${fmt(netProfit)} ₺`}
              valueColor={netProfit >= 0 ? "#22c55e" : "#ef4444"}
              gradient={netProfit >= 0 ? "bg-emerald-500" : "bg-red-500"}
              iconColor={netProfit >= 0 ? "text-emerald-400" : "text-red-400"}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            />
          </div>

          {/* Revenue by payment method */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div onClick={() => toggle("revenue")}
              className={`flex cursor-pointer items-center justify-between px-6 py-4 transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
              <div className="flex items-center gap-4">
                <span className={`${isDark ? "text-white/60" : "text-gray-600"} transition-transform ${expanded.revenue ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byPaymentMethod}</span>
              </div>
              <span className="font-medium text-sm">{fmt(revenue?.totalAmountInTry || 0)} ₺</span>
            </div>
            {expanded.revenue && revenue?.byPaymentMethod && (
              <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} px-8 py-2 ${isDark ? "bg-white/[0.02]" : "bg-white"}`}>
                {revenue.byPaymentMethod.length > 0 ? revenue.byPaymentMethod.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 pl-6 border-b ${isDark ? "border-white/5" : "border-gray-100"} last:border-0 text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>
                    <span>{translatePaymentLabel(item.label, language)}</span>
                    <span>{fmt(item.amountInTry)} ₺</span>
                  </div>
                )) : (
                  <div className={`py-4 pl-6 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{text.noData}</div>
                )}
              </div>
            )}
          </div>

          {/* Revenue by staff */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div onClick={() => toggle("staff")}
              className={`flex cursor-pointer items-center justify-between px-6 py-4 transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
              <div className="flex items-center gap-4">
                <span className={`${isDark ? "text-white/60" : "text-gray-600"} transition-transform ${expanded.staff ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byStaff}</span>
              </div>
            </div>
            {expanded.staff && revenue?.byStaff && (
              <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} px-8 py-2 ${isDark ? "bg-white/[0.02]" : "bg-white"}`}>
                {revenue.byStaff.length > 0 ? revenue.byStaff.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 pl-6 border-b ${isDark ? "border-white/5" : "border-gray-100"} last:border-0 text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>
                    <span>{translatePaymentLabel(item.label, language)}</span>
                    <span>{fmt(item.amountInTry)} ₺</span>
                  </div>
                )) : (
                  <div className={`py-4 pl-6 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{text.noData}</div>
                )}
              </div>
            )}
          </div>

          {/* Expenses by category */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div onClick={() => toggle("category")}
              className={`flex cursor-pointer items-center justify-between px-6 py-4 transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
              <div className="flex items-center gap-4">
                <span className={`${isDark ? "text-white/60" : "text-gray-600"} transition-transform ${expanded.category ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byCategory}</span>
              </div>
              <span className="font-medium text-sm">{fmt(expense?.totalAmountInTry || 0)} ₺</span>
            </div>
            {expanded.category && expense?.byCategory && (
              <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} px-8 py-2 ${isDark ? "bg-white/[0.02]" : "bg-white"}`}>
                {expense.byCategory.length > 0 ? expense.byCategory.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 pl-6 border-b ${isDark ? "border-white/5" : "border-gray-100"} last:border-0 text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>
                    <span>{translatePaymentLabel(item.label, language)}</span>
                    <span>{fmt(item.amountInTry)} ₺</span>
                  </div>
                )) : (
                  <div className={`py-4 pl-6 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{text.noData}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

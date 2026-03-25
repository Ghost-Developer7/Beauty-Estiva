"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { financialReportService } from "@/services/financialReportService";
import type { RevenueSummary, ExpenseSummary } from "@/types/api";
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

export default function CashReportScreen() {
  const { language } = useLanguage();
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

  const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const netProfit = (revenue?.totalAmountInTry || 0) - (expense?.totalAmountInTry || 0);

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <div className="flex items-center gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-white/60">{text.loading}</div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">{text.revenue}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{fmt(revenue?.totalAmountInTry || 0)} TRY</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">{text.expenses}</p>
              <p className="mt-2 text-2xl font-semibold text-red-400">{fmt(expense?.totalAmountInTry || 0)} TRY</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">{text.netProfit}</p>
              <p className={`mt-2 text-2xl font-semibold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmt(netProfit)} TRY
              </p>
            </div>
          </div>

          {/* Revenue by payment method */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div onClick={() => toggle("revenue")}
              className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5">
              <div className="flex items-center gap-4">
                <span className={`text-white/60 transition-transform ${expanded.revenue ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byPaymentMethod}</span>
              </div>
              <span className="font-medium text-sm">{fmt(revenue?.totalAmountInTry || 0)} TRY</span>
            </div>
            {expanded.revenue && revenue?.byPaymentMethod && (
              <div className="border-t border-white/10 px-8 py-2 bg-white/[0.02]">
                {revenue.byPaymentMethod.length > 0 ? revenue.byPaymentMethod.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 pl-6 border-b border-white/5 last:border-0 text-xs text-white/60">
                    <span>{item.label}</span>
                    <span>{fmt(item.amountInTry)} TRY</span>
                  </div>
                )) : (
                  <div className="py-4 pl-6 text-xs text-white/40">{text.noData}</div>
                )}
              </div>
            )}
          </div>

          {/* Revenue by staff */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div onClick={() => toggle("staff")}
              className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5">
              <div className="flex items-center gap-4">
                <span className={`text-white/60 transition-transform ${expanded.staff ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byStaff}</span>
              </div>
            </div>
            {expanded.staff && revenue?.byStaff && (
              <div className="border-t border-white/10 px-8 py-2 bg-white/[0.02]">
                {revenue.byStaff.length > 0 ? revenue.byStaff.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 pl-6 border-b border-white/5 last:border-0 text-xs text-white/60">
                    <span>{item.label}</span>
                    <span>{fmt(item.amountInTry)} TRY</span>
                  </div>
                )) : (
                  <div className="py-4 pl-6 text-xs text-white/40">{text.noData}</div>
                )}
              </div>
            )}
          </div>

          {/* Expenses by category */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div onClick={() => toggle("category")}
              className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5">
              <div className="flex items-center gap-4">
                <span className={`text-white/60 transition-transform ${expanded.category ? "rotate-90" : ""}`}>›</span>
                <span className="font-medium text-sm">{text.byCategory}</span>
              </div>
              <span className="font-medium text-sm">{fmt(expense?.totalAmountInTry || 0)} TRY</span>
            </div>
            {expanded.category && expense?.byCategory && (
              <div className="border-t border-white/10 px-8 py-2 bg-white/[0.02]">
                {expense.byCategory.length > 0 ? expense.byCategory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 pl-6 border-b border-white/5 last:border-0 text-xs text-white/60">
                    <span>{item.label}</span>
                    <span>{fmt(item.amountInTry)} TRY</span>
                  </div>
                )) : (
                  <div className="py-4 pl-6 text-xs text-white/40">{text.noData}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

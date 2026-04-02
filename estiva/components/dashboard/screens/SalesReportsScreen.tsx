"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import SharedStatCard from "@/components/ui/StatCard";
import { financialReportService } from "@/services/financialReportService";
import type { FinancialDashboard, RevenueSummary, RevenueByGroup, DailyAmount } from "@/types/api";

/* ═══════════════════════════════════════════
   COPY
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    title: "Sales Reports",
    tabs: ["Overview", "Daily Revenue", "Services", "Staff", "Payment Methods"],
    // Period
    thisMonth: "This Month", lastMonth: "Last Month", thisWeek: "This Week", last30: "Last 30 Days", last90: "Last 90 Days", custom: "Custom",
    // Overview
    totalRevenue: "Total Revenue", totalExpense: "Total Expense", netIncome: "Net Income",
    totalAppointments: "Appointments", paidAppointments: "Paid", unpaidAppointments: "Unpaid",
    paymentRate: "Payment Rate",
    // Table
    date: "Date", day: "Day", amount: "Amount", count: "Count", total: "Total",
    service: "Service", staff: "Staff", method: "Method",
    noData: "No data for the selected period.", loading: "Loading...",
    // Chart labels
    revenue: "Revenue", expense: "Expense",
    topServices: "Top Services", topStaff: "Top Staff", expenseCategories: "Expense Categories",
  },
  tr: {
    title: "Satış Raporları",
    tabs: ["Genel Bakış", "Günlük Gelir", "Hizmetler", "Personel", "Ödeme Yöntemleri"],
    thisMonth: "Bu Ay", lastMonth: "Geçen Ay", thisWeek: "Bu Hafta", last30: "Son 30 Gün", last90: "Son 90 Gün", custom: "Özel",
    totalRevenue: "Toplam Gelir", totalExpense: "Toplam Gider", netIncome: "Net Gelir",
    totalAppointments: "Randevular", paidAppointments: "Ödenen", unpaidAppointments: "Ödenmemiş",
    paymentRate: "Tahsilat Oranı",
    date: "Tarih", day: "Gün", amount: "Tutar", count: "Adet", total: "Toplam",
    service: "Hizmet", staff: "Personel", method: "Yöntem",
    noData: "Seçilen dönem için veri bulunamadı.", loading: "Yükleniyor...",
    revenue: "Gelir", expense: "Gider",
    topServices: "En Çok Hizmetler", topStaff: "En Çok Personel", expenseCategories: "Gider Kategorileri",
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

function getDateRange(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const toStr = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

  switch (period) {
    case "thisWeek": {
      const day = now.getDay() || 7;
      const mon = new Date(y, m, d - day + 1);
      return { startDate: toStr(mon), endDate: toStr(now) };
    }
    case "lastMonth": {
      const s = new Date(y, m - 1, 1);
      const e = new Date(y, m, 0);
      return { startDate: toStr(s), endDate: toStr(e) };
    }
    case "last30": {
      const s = new Date(y, m, d - 30);
      return { startDate: toStr(s), endDate: toStr(now) };
    }
    case "last90": {
      const s = new Date(y, m, d - 90);
      return { startDate: toStr(s), endDate: toStr(now) };
    }
    default: { // thisMonth
      const s = new Date(y, m, 1);
      return { startDate: toStr(s), endDate: toStr(now) };
    }
  }
}

const DAYS_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function SalesReportsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const range = getDateRange(period);
    try {
      const [dashRes, revRes] = await Promise.all([
        financialReportService.dashboard(range),
        financialReportService.revenue(range),
      ]);
      if (dashRes.data.success && dashRes.data.data) setDashboard(dashRes.data.data);
      if (revRes.data.success && revRes.data.data) setRevenue(revRes.data.data);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Period options ─── */
  const periods = [
    { value: "thisMonth", label: t.thisMonth },
    { value: "lastMonth", label: t.lastMonth },
    { value: "thisWeek", label: t.thisWeek },
    { value: "last30", label: t.last30 },
    { value: "last90", label: t.last90 },
  ];

  /* ─── Derived stats ─── */
  const totalRev = dashboard?.totalRevenueTRY ?? 0;
  const totalExp = dashboard?.totalExpenseTRY ?? 0;
  const netInc = dashboard?.netIncomeTRY ?? 0;
  const totalAppts = dashboard?.totalAppointments ?? 0;
  const paidAppts = dashboard?.paidAppointments ?? 0;
  const unpaidAppts = dashboard?.unpaidAppointments ?? 0;
  const paymentRate = totalAppts > 0 ? Math.round((paidAppts / totalAppts) * 100) : 0;

  /* ─── Skeleton ─── */
  const Skeleton = ({ w = "w-20", h = "h-5" }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
  );

  /* ─── Bar chart (simple CSS) ─── */
  const BarChart = ({ items, color }: { items: RevenueByGroup[] | undefined | null; color: string }) => {
    const safeItems = items ?? [];
    const max = Math.max(...safeItems.map(i => i.amountInTry), 1);
    return (
      <div className="space-y-2.5">
        {safeItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className={`w-32 shrink-0 truncate text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>{item.label}</span>
            <div className="flex-1 h-6 relative">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{ width: `${Math.max((item.amountInTry / max) * 100, 2)}%`, backgroundColor: color, opacity: 0.8 }}
              />
              <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-medium pr-2 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                ₺{fmt(item.amountInTry)}
              </span>
            </div>
            <span className={`shrink-0 text-[10px] w-8 text-center ${isDark ? "text-white/30" : "text-gray-400"}`}>{item.count}x</span>
          </div>
        ))}
        {safeItems.length === 0 && <p className={`text-xs text-center py-4 ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.noData}</p>}
      </div>
    );
  };

  /* ─── GroupTable ─── */
  const GroupTable = ({ items, labelHeader, color }: { items: RevenueByGroup[] | undefined | null; labelHeader: string; color: string }) => (
    <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{labelHeader}</th>
            <th className={`px-5 py-3 text-center text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.count}</th>
            <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.amount}</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
          {(items ?? []).map((item, idx) => (
            <tr key={idx} className={`transition ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
              <td className="px-5 py-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className={`text-sm ${isDark ? "text-white/80" : "text-gray-800"}`}>{item.label}</span>
              </td>
              <td className={`px-5 py-3 text-center text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{item.count}</td>
              <td className={`px-5 py-3 text-right font-medium ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt(item.amountInTry)}</td>
            </tr>
          ))}
          {(items ?? []).length === 0 && (
            <tr><td colSpan={3} className={`py-8 text-center text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.noData}</td></tr>
          )}
        </tbody>
        {(items ?? []).length > 0 && (
          <tfoot>
            <tr className={`border-t ${isDark ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
              <td className={`px-5 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t.total}</td>
              <td className={`px-5 py-3 text-center text-xs font-bold ${isDark ? "text-white/60" : "text-gray-600"}`}>{(items ?? []).reduce((s, i) => s + i.count, 0)}</td>
              <td className={`px-5 py-3 text-right font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt((items ?? []).reduce((s, i) => s + i.amountInTry, 0))}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  /* ─── DailyTable ─── */
  const DailyTable = ({ items }: { items: DailyAmount[] | undefined | null }) => {
    const sorted = [...(items ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = sorted.reduce((s, i) => s + i.amountInTry, 0);
    const dayNames = language === "tr" ? DAYS_TR : DAYS_EN;
    const locale = language === "tr" ? "tr-TR" : "en-US";
    return (
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
              <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.date}</th>
              <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.day}</th>
              <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.amount}</th>
              <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"} w-32`} />
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
            {sorted.map((item, idx) => {
              const dt = new Date(item.date);
              const pct = total > 0 ? (item.amountInTry / total) * 100 : 0;
              return (
                <tr key={idx} className={`transition ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
                  <td className={`px-5 py-3 text-sm ${isDark ? "text-white/80" : "text-gray-800"}`}>
                    {dt.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className={`px-5 py-3 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {dayNames[dt.getDay()]}
                  </td>
                  <td className={`px-5 py-3 text-right font-medium ${item.amountInTry > 0 ? "text-emerald-500" : isDark ? "text-white/30" : "text-gray-300"}`}>
                    {item.amountInTry > 0 ? `₺${fmt(item.amountInTry)}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className={`h-1.5 rounded-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                      <div className="h-full rounded-full bg-emerald-500/60 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={4} className={`py-8 text-center text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.noData}</td></tr>
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr className={`border-t ${isDark ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
                <td className={`px-5 py-3 font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t.total}</td>
                <td />
                <td className="px-5 py-3 text-right font-bold text-emerald-500">₺{fmt(total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={`min-w-[150px] rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value} className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-xl border ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-gray-200 bg-gray-50/50"} px-4 py-3 space-y-2`}>
              <Skeleton w="w-20" h="h-3" /><Skeleton w="w-28" h="h-7" />
            </div>
          ))
        ) : (
          <>
            <SharedStatCard
              label={t.totalRevenue}
              value={`₺${fmt(totalRev)}`}
              valueColor="#22c55e"
              gradient="bg-emerald-500"
              iconColor="text-emerald-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            />
            <SharedStatCard
              label={t.totalExpense}
              value={`₺${fmt(totalExp)}`}
              valueColor="#ef4444"
              gradient="bg-red-500"
              iconColor="text-red-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
            />
            <SharedStatCard
              label={t.netIncome}
              value={`₺${fmt(netInc)}`}
              valueColor={netInc >= 0 ? "#3b82f6" : "#ef4444"}
              gradient={netInc >= 0 ? "bg-blue-500" : "bg-red-500"}
              iconColor={netInc >= 0 ? "text-blue-400" : "text-red-400"}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            />
            <SharedStatCard
              label={t.paymentRate}
              value={`%${paymentRate}`}
              sub={`${paidAppts}/${totalAppts}`}
              valueColor="#a855f7"
              gradient="bg-purple-500"
              iconColor="text-purple-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
            />
          </>
        )}
      </div>

      {/* ─── TABS ─── */}
      <div className={`flex flex-wrap gap-1 rounded-2xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"} p-1.5`}>
        {t.tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === i
                ? isDark ? "bg-white/10 text-white shadow" : "bg-white text-gray-900 shadow-sm"
                : isDark ? "text-white/40 hover:bg-white/5 hover:text-white/70" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}
      {loading ? (
        <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
          <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
          {t.loading}
        </div>
      ) : (
        <>
          {/* Tab 0: Overview */}
          {activeTab === 0 && dashboard && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Services */}
              <div className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"} p-5`}>
                <h3 className={`mb-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>{t.topServices}</h3>
                <BarChart items={dashboard.topTreatments} color="#8b5cf6" />
              </div>

              {/* Top Staff */}
              <div className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"} p-5`}>
                <h3 className={`mb-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>{t.topStaff}</h3>
                <BarChart items={dashboard.topStaff} color="#3b82f6" />
              </div>

              {/* Payment Methods */}
              <div className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"} p-5`}>
                <h3 className={`mb-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>{t.tabs[4]}</h3>
                <BarChart items={(dashboard.paymentMethods ?? []).map(pm => ({ ...pm, label: translatePaymentLabel(pm.label, language) }))} color="#22c55e" />
              </div>

              {/* Expense Categories */}
              <div className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"} p-5`}>
                <h3 className={`mb-4 text-sm font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>{t.expenseCategories}</h3>
                <BarChart items={dashboard.topExpenseCategories} color="#ef4444" />
              </div>
            </div>
          )}

          {/* Tab 1: Daily Revenue */}
          {activeTab === 1 && revenue && (
            <DailyTable items={revenue.dailyBreakdown} />
          )}

          {/* Tab 2: Services */}
          {activeTab === 2 && revenue && (
            <GroupTable items={revenue.byTreatment} labelHeader={t.service} color="#8b5cf6" />
          )}

          {/* Tab 3: Staff */}
          {activeTab === 3 && revenue && (
            <GroupTable items={revenue.byStaff} labelHeader={t.staff} color="#3b82f6" />
          )}

          {/* Tab 4: Payment Methods */}
          {activeTab === 4 && revenue && (
            <GroupTable items={(revenue.byPaymentMethod ?? []).map(pm => ({ ...pm, label: translatePaymentLabel(pm.label, language) }))} labelHeader={t.method} color="#22c55e" />
          )}
        </>
      )}
    </div>
  );
}


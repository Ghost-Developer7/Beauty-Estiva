"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { tenantService } from "@/services/tenantService";
import { staffLeaveService } from "@/services/staffLeaveService";
import type { TenantInfo } from "@/services/tenantService";
import type { DashboardSummary, StaffLeaveListItem } from "@/types/api";
import toast from "react-hot-toast";
import SharedStatCard from "@/components/ui/StatCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Colors ──────────────────────────────────────────────────────────────────
const CHART_COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
const STATUS_COLORS: Record<string, string> = {
  Scheduled: "#3b82f6",
  Confirmed: "#10b981",
  Completed: "#06b6d4",
  Cancelled: "#ef4444",
  NoShow: "#f59e0b",
};

// ─── i18n ────────────────────────────────────────────────────────────────────
const copy = {
  en: {
    welcome: "Welcome back",
    todayAppointments: "TODAY'S APPOINTMENTS",
    monthRevenue: "THIS MONTH REVENUE",
    totalCustomers: "TOTAL CUSTOMERS",
    activePackages: "ACTIVE PACKAGES",
    upcoming: "upcoming",
    revenueExpenseTrend: "REVENUE & EXPENSE TREND",
    appointmentStatus: "APPOINTMENT STATUS",
    customerGrowth: "CUSTOMER GROWTH",
    topServicesRevenue: "TOP SERVICES BY REVENUE",
    todaySchedule: "TODAY'S SCHEDULE",
    quickStats: "QUICK STATS",
    revenue: "Revenue",
    expense: "Expense",
    newCustomers: "New Customers",
    totalCust: "Total",
    noData: "No data available",
    loading: "Loading...",
    time: "TIME",
    customer: "CUSTOMER",
    treatment: "TREATMENT",
    staff: "STAFF",
    status: "STATUS",
    thisWeek: "This Week",
    thisMonth: "This Month",
    netProfit: "NET PROFIT",
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No Show",
    topStaff: "TOP STAFF BY REVENUE",
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    employeeOfMonth: "EMPLOYEE OF THE MONTH",
    employeeOfMonthSub: "Top performer this month",
    todayProgress: "TODAY'S PROGRESS",
    todayProgressSub: "completed",
    completionRate: "COMPLETION RATE",
    completionRateSub: "this month",
    appointments: "appointments",
    cancellationAlert: "CANCELLATIONS TODAY",
    noShowAlert: "no-shows",
    alertSub: "attention needed",
    onLeaveToday: "ON LEAVE TODAY",
    noLeave: "No one is on leave today",
    leaveType: "Leave",
  },
  tr: {
    welcome: "Tekrar hoş geldiniz",
    todayAppointments: "BUGÜNÜN RANDEVULARI",
    monthRevenue: "BU AY GELİR",
    totalCustomers: "TOPLAM MÜŞTERİ",
    activePackages: "AKTİF PAKETLER",
    upcoming: "yaklaşan",
    revenueExpenseTrend: "GELİR & GİDER TRENDİ",
    appointmentStatus: "RANDEVU DURUMU",
    customerGrowth: "MÜŞTERİ BÜYÜMESİ",
    topServicesRevenue: "GELİRE GÖRE EN İYİ HİZMETLER",
    todaySchedule: "BUGÜNÜN PROGRAMI",
    quickStats: "HIZLI İSTATİSTİKLER",
    revenue: "Gelir",
    expense: "Gider",
    newCustomers: "Yeni Müşteri",
    totalCust: "Toplam",
    noData: "Veri bulunamadı",
    loading: "Yükleniyor...",
    time: "SAAT",
    customer: "MÜŞTERİ",
    treatment: "HİZMET",
    staff: "PERSONEL",
    status: "DURUM",
    thisWeek: "Bu Hafta",
    thisMonth: "Bu Ay",
    netProfit: "NET KAR",
    scheduled: "Planlandı",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal",
    noShow: "Gelmedi",
    topStaff: "GELİRE GÖRE EN İYİ PERSONEL",
    monthNames: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
    employeeOfMonth: "AYIN YILDIZI",
    employeeOfMonthSub: "Bu ayın en iyi personeli",
    todayProgress: "BUGÜNKÜ İLERLEME",
    todayProgressSub: "tamamlandı",
    completionRate: "TAMAMLANMA ORANI",
    completionRateSub: "bu ay",
    appointments: "randevu",
    cancellationAlert: "BUGÜN İPTAL / GELMEDİ",
    noShowAlert: "gelmedi",
    alertSub: "dikkat gerekiyor",
    onLeaveToday: "BUGÜN İZİNLİ",
    noLeave: "Bugün izinli personel yok",
    leaveType: "İzin",
  },
};

const STATUS_TR: Record<string, string> = {
  Scheduled: "Planlandı",
  Confirmed: "Onaylandı",
  Completed: "Tamamlandı",
  Cancelled: "İptal",
  NoShow: "Gelmedi",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-50"} ${className}`}
    />
  );
}

function CardSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm`}>
      <Skeleton className="mb-3 h-4 w-24" isDark={isDark} />
      <Skeleton className="h-8 w-32" isDark={isDark} />
      <Skeleton className="mt-2 h-3 w-20" isDark={isDark} />
    </div>
  );
}

function ChartSkeleton({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm ${className}`}>
      <Skeleton className="mb-6 h-5 w-48" isDark={isDark} />
      <Skeleton className="h-[280px] w-full" isDark={isDark} />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return amount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatMonthLabel(monthStr: string, monthNames: string[]): string {
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  return monthNames[monthIdx] || monthStr;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]/95" : "bg-white/95"} px-4 py-3 shadow-xl backdrop-blur-md`}>
      <p className={`mb-1 text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)} ₺
        </p>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function OverviewScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const t = copy[language];

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [todayLeaves, setTodayLeaves] = useState<StaffLeaveListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Role checks
  const roles = useMemo(() => user?.roles ?? [], [user]);
  const isOwnerOrAdmin = useMemo(
    () => roles.some((r) => r === "Owner" || r === "Admin" || r === "SuperAdmin"),
    [roles],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, tenantRes, leavesRes] = await Promise.allSettled([
        dashboardService.getSummary(),
        tenantService.getTenantInfo(),
        staffLeaveService.list({ status: "Approved" }),
      ]);
      if (res.status === "fulfilled" && res.value.data.success && res.value.data.data) {
        setData(res.value.data.data);
      }
      if (tenantRes.status === "fulfilled" && tenantRes.value.data.success && tenantRes.value.data.data) {
        setTenantInfo(tenantRes.value.data.data);
      }
      if (leavesRes.status === "fulfilled" && leavesRes.value.data.success && leavesRes.value.data.data) {
        const todayDate = new Date().toISOString().slice(0, 10);
        const onLeave = leavesRes.value.data.data.filter((l: StaffLeaveListItem) => {
          const start = l.startDate.slice(0, 10);
          const end = l.endDate.slice(0, 10);
          return todayDate >= start && todayDate <= end;
        });
        // Deduplicate by staffId
        const seen = new Set<number>();
        setTodayLeaves(onLeave.filter((l: StaffLeaveListItem) => {
          if (seen.has(l.staffId)) return false;
          seen.add(l.staffId);
          return true;
        }));
      }
    } catch {
      toast.error(language === "tr" ? "Dashboard verileri yüklenemedi" : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Date display ────────────────────────────────────────────────────────
  const todayStr = new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Chart data ──────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    if (!data) return [];
    return data.monthlyTrend.map((m) => ({
      name: formatMonthLabel(m.month, t.monthNames),
      [t.revenue]: m.revenue,
      [t.expense]: m.expense,
    }));
  }, [data, t]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const d = data.statusDistribution;
    return [
      { name: t.scheduled, value: d.scheduled, color: STATUS_COLORS.Scheduled },
      { name: t.confirmed, value: d.confirmed, color: STATUS_COLORS.Confirmed },
      { name: t.completed, value: d.completed, color: STATUS_COLORS.Completed },
      { name: t.cancelled, value: d.cancelled, color: STATUS_COLORS.Cancelled },
      { name: t.noShow, value: d.noShow, color: STATUS_COLORS.NoShow },
    ].filter((item) => item.value > 0);
  }, [data, t]);

  const customerData = useMemo(() => {
    if (!data) return [];
    return data.customerGrowth.map((c) => ({
      name: formatMonthLabel(c.month, t.monthNames),
      [t.newCustomers]: c.newCustomers,
      [t.totalCust]: c.totalCustomers,
    }));
  }, [data, t]);

  const topServicesData = useMemo(() => {
    if (!data) return [];
    return data.topServices.map((s) => ({
      name: s.label,
      value: s.amountInTry,
    }));
  }, [data]);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
        {/* Welcome skeleton */}
        <div>
          <Skeleton className="h-4 w-48" isDark={isDark} />
          <Skeleton className="mt-2 h-8 w-72" isDark={isDark} />
        </div>
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton  isDark={isDark} />
          <CardSkeleton  isDark={isDark} />
          <CardSkeleton  isDark={isDark} />
          <CardSkeleton  isDark={isDark} />
        </div>
        {/* Charts row 1 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartSkeleton className="lg:col-span-2" isDark={isDark} />
          <ChartSkeleton  isDark={isDark} />
        </div>
        {/* Charts row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartSkeleton  isDark={isDark} />
          <ChartSkeleton  isDark={isDark} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`flex h-64 items-center justify-center ${isDark ? "text-white/60" : "text-gray-600"}`}>
        {t.noData}
      </div>
    );
  }

  // ── Stat cards ──────────────────────────────────────────────────────────
  const statCards = [
    {
      label: t.todayAppointments,
      value: data.todayAppointmentsCount.toString(),
      sub: `${data.upcomingAppointments} ${t.upcoming}`,
      href: "/dashboard/appointments?view=list",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      gradient: "bg-pink-500",
      iconColor: "text-pink-400",
    },
    {
      label: t.monthRevenue,
      value: `${formatCurrency(data.thisMonthRevenue)} ₺`,
      sub: `${t.thisWeek}: ${formatCurrency(data.thisWeekRevenue)} ₺`,
      href: "/dashboard/reports/sales",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "bg-emerald-500",
      iconColor: "text-emerald-400",
      visible: isOwnerOrAdmin,
    },
    {
      label: t.totalCustomers,
      value: data.totalCustomers.toString(),
      sub: "",
      href: "/dashboard/customers",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      gradient: "bg-blue-500",
      iconColor: "text-blue-400",
    },
    {
      label: t.activePackages,
      value: data.activePackages.toString(),
      sub: "",
      href: "/dashboard/package-sales",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
      gradient: "bg-amber-500",
      iconColor: "text-amber-400",
    },
  ].filter((c) => c.visible !== false);

  const netProfit = data.thisMonthRevenue - data.thisMonthExpense;

  // ── Highlights ──────────────────────────────────────────────────────────
  const starEmployee = data.topStaff[0] ?? null;
  const todayCompleted = data.todaySchedule.filter((a) => a.status === "Completed").length;
  const todayTotal = data.todayAppointmentsCount || data.todaySchedule.length || 1;
  const todayPct = Math.round((todayCompleted / todayTotal) * 100);
  const RING_R = 42;
  const ringCircum = 2 * Math.PI * RING_R;
  const ringDash = (todayPct / 100) * ringCircum;

  const sd = data.statusDistribution;
  const totalStatusAppts = sd.scheduled + sd.confirmed + sd.completed + sd.cancelled + sd.noShow;
  const completionRate = totalStatusAppts > 0 ? Math.round((sd.completed / totalStatusAppts) * 100) : 0;

  const todayCancelled = data.todaySchedule.filter((a) => a.status === "Cancelled").length;
  const todayNoShow = data.todaySchedule.filter((a) => a.status === "NoShow").length;
  const hasAlert = todayCancelled + todayNoShow >= 2;

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* ── Row 0: Welcome ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {tenantInfo?.companyName && (
            <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd1dc] to-[#f3a4ff]">
              {tenantInfo.companyName}
            </p>
          )}
          <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.welcome},</p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {user?.name} {user?.surname}
          </h1>
        </div>
        <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{todayStr}</p>
      </div>

      {/* ── Row 1: Stat Cards ───────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <SharedStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            sub={card.sub || undefined}
            icon={card.icon}
            gradient={card.gradient}
            iconColor={card.iconColor}
            href={card.href}
          />
        ))}
      </section>

      {/* ── On Leave Today ───────────────────────────────────────────────── */}
      {todayLeaves.length > 0 && (
        <section className={`rounded-2xl border p-4 ${
          isDark
            ? "border-white/[0.06] bg-white/[0.02]"
            : "border-gray-200 bg-gray-50/50"
        }`}>
          <p className={`mb-3 text-[11px] font-semibold uppercase tracking-widest ${isDark ? "text-white/25" : "text-gray-400"}`}>
            {t.onLeaveToday}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {todayLeaves.map((leave) => {
              const initials = leave.staffFullName.split(" ").map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
              return (
                <div
                  key={leave.id}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 min-w-[220px] shrink-0 transition-all duration-300 hover:scale-[1.02] ${
                    isDark
                      ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 hover:bg-amber-500/10"
                      : "border-amber-200 bg-amber-50 hover:border-amber-300"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-500/40 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${isDark ? "text-white/90" : "text-gray-900"}`}>
                      {leave.staffFullName}
                    </p>
                    <p className={`text-[10px] ${isDark ? "text-amber-400/60" : "text-amber-600"}`}>
                      {leave.leaveType === "Annual" ? (language === "tr" ? "Yıllık İzin" : "Annual Leave") :
                       leave.leaveType === "Sick" ? (language === "tr" ? "Hastalık İzni" : "Sick Leave") :
                       leave.leaveType === "Maternity" ? (language === "tr" ? "Doğum İzni" : "Maternity Leave") :
                       leave.leaveType === "Unpaid" ? (language === "tr" ? "Ücretsiz İzin" : "Unpaid Leave") :
                       (language === "tr" ? "Diğer" : "Other")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Net Profit banner (owner/admin only) ────────────────────────── */}
      {isOwnerOrAdmin && (() => {
        const sparkData = data.monthlyTrend.slice(-6);
        const maxVal = Math.max(...sparkData.map(m => m.revenue), 1);
        const BAR_W = 8, BAR_GAP = 4, SVG_H = 36;
        const totalW = sparkData.length * (BAR_W + BAR_GAP) - BAR_GAP;
        return (
          <div className={`flex flex-wrap items-center gap-6 rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 px-6 py-4 backdrop-blur-sm`}>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.netProfit} ({t.thisMonth})</p>
              <p className={`mt-1 text-2xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)} ₺
              </p>
            </div>
            {/* mini sparkline */}
            {sparkData.length > 0 && (
              <div className="hidden sm:flex flex-col items-center gap-1">
                <svg width={totalW} height={SVG_H} viewBox={`0 0 ${totalW} ${SVG_H}`}>
                  {sparkData.map((m, i) => {
                    const barH = Math.max((m.revenue / maxVal) * SVG_H, 3);
                    const x = i * (BAR_W + BAR_GAP);
                    const isLast = i === sparkData.length - 1;
                    return (
                      <rect
                        key={i}
                        x={x} y={SVG_H - barH} width={BAR_W} height={barH}
                        rx="2"
                        fill={isLast ? "#ec4899" : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
                        style={isLast ? { filter: "drop-shadow(0 0 4px #ec4899aa)" } : {}}
                      />
                    );
                  })}
                </svg>
                <span className={`text-[9px] tracking-wider ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.revenueExpenseTrend.split(" ")[0]}</span>
              </div>
            )}
            <div className="flex gap-8 text-sm">
              <div>
                <p className={`${isDark ? "text-white/40" : "text-gray-400"}`}>{t.revenue}</p>
                <p className="font-semibold text-emerald-400">{formatCurrency(data.thisMonthRevenue)} ₺</p>
              </div>
              <div>
                <p className={`${isDark ? "text-white/40" : "text-gray-400"}`}>{t.expense}</p>
                <p className="font-semibold text-red-400">{formatCurrency(data.thisMonthExpense)} ₺</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Highlights Row ──────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Ayın Yıldızı */}
        {isOwnerOrAdmin && starEmployee && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 backdrop-blur-sm">
            {/* shimmer */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-widest text-amber-400/80 mb-1">{t.employeeOfMonth}</p>
                <p className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{starEmployee.label}</p>
                <p className="mt-0.5 text-xs text-amber-400 font-semibold">{formatCurrency(starEmployee.amountInTry)} ₺</p>
                <p className={`mt-1 text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {starEmployee.count} {t.appointments} · {t.employeeOfMonthSub}
                </p>
              </div>
              <div className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white drop-shadow">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7 2h8.6a1 1 0 010 2H7.7a1 1 0 010-2z"/>
                </svg>
                <span className="absolute -top-1.5 -right-1.5 text-base">👑</span>
              </div>
            </div>
          </div>
        )}

        {/* Bugünkü İlerleme (donut ring) */}
        <div className={`relative overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} bg-gradient-to-br from-cyan-500/10 via-teal-500/8 to-blue-500/10 p-5 backdrop-blur-sm`}>
          <p className="text-[10px] font-bold tracking-widest text-cyan-400/80 mb-3">{t.todayProgress}</p>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r={RING_R} fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} strokeWidth="10" />
                <circle
                  cx="50" cy="50" r={RING_R}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${ringCircum}`}
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-cyan-400">{todayPct}%</span>
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{todayCompleted}<span className={`text-base font-normal ml-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>/ {todayTotal}</span></p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.appointments} {t.todayProgressSub}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sd.completed > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">{sd.completed} {t.completed}</span>}
                {sd.cancelled > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">{sd.cancelled} {t.cancelled}</span>}
                {sd.noShow > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">{sd.noShow} {t.noShow}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tamamlanma oranı — gauge arc */}
        {(() => {
          const gaugeColor = completionRate >= 70 ? "#a855f7" : completionRate >= 40 ? "#f59e0b" : "#ef4444";
          const arcLen = Math.PI * 50; // semicircle circumference ≈ 157
          const arcFill = (completionRate / 100) * arcLen;
          return (
            <div className={`relative overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} bg-gradient-to-br from-purple-500/10 via-violet-500/8 to-pink-500/10 p-5 backdrop-blur-sm`}>
              {hasAlert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              <p className="text-[10px] font-bold tracking-widest text-purple-400/80 mb-2">{t.completionRate}</p>
              {/* Gauge arc */}
              <div className="flex flex-col items-center">
                <div className="relative w-[120px]">
                  <svg width="120" height="68" viewBox="0 0 120 68">
                    {/* track */}
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"} strokeWidth="10" strokeLinecap="round" />
                    {/* fill */}
                    <path
                      d="M 10 65 A 50 50 0 0 1 110 65"
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${arcFill} ${arcLen}`}
                      style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}80)`, transition: "stroke-dasharray 1s ease" }}
                    />
                    {/* needle dot */}
                    <circle cx="60" cy="65" r="5" fill={gaugeColor} style={{ filter: `drop-shadow(0 0 4px ${gaugeColor})` }} />
                  </svg>
                  {/* center label */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-1">
                    <span className="text-2xl font-bold leading-none" style={{ color: gaugeColor }}>%{completionRate}</span>
                  </div>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.completionRateSub}</p>
              </div>
              {/* status pills */}
              {hasAlert && (
                <div className={`mt-3 rounded-xl ${isDark ? "bg-red-500/10" : "bg-red-50"} border border-red-500/20 px-3 py-2 text-[11px] text-red-400`}>
                  ⚠ {todayCancelled} {t.cancelled} · {todayNoShow} {t.noShowAlert}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* ── Row 2: Revenue Trend + Pie ──────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Revenue/Expense Line Chart */}
        {isOwnerOrAdmin && (
          <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm lg:col-span-2`}>
            <h2 className={`mb-4 text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
              {t.revenueExpenseTrend}
            </h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip  isDark={isDark} />} cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                  <Legend wrapperStyle={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: 12 }} />
                  <Line type="monotone" dataKey={t.revenue} stroke="#ec4899" strokeWidth={2.5} dot={{ fill: "#ec4899", r: 4 }} activeDot={{ r: 6, fill: "#ec4899" }} />
                  <Line type="monotone" dataKey={t.expense} stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6, fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex h-[280px] items-center justify-center ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.noData}</div>
            )}
          </div>
        )}

        {/* Appointment Status Pie/Donut Chart */}
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm ${!isOwnerOrAdmin ? "lg:col-span-3" : ""}`}>
          <h2 className={`mb-4 text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
            {t.appointmentStatus}
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "rgba(26,26,46,0.95)" : "rgba(255,255,255,0.95)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                    color: isDark ? "#fff" : "#111",
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                  formatter={(value: string) => <span className={`${isDark ? "text-white/60" : "text-gray-600"}`}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex h-[280px] items-center justify-center ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.noData}</div>
          )}
        </div>
      </section>

      {/* ── Row 3: Customer Growth + Top Services ───────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Customer Growth Bar Chart */}
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm`}>
          <h2 className={`mb-4 text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
            {t.customerGrowth}
          </h2>
          {customerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip  isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} />
                <Legend wrapperStyle={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: 12 }} />
                <Bar dataKey={t.newCustomers} fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t.totalCust} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex h-[280px] items-center justify-center ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.noData}</div>
          )}
        </div>

        {/* Top Services Horizontal Bar */}
        {isOwnerOrAdmin && (
          <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm`}>
            <h2 className={`mb-4 text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
              {t.topServicesRevenue}
            </h2>
            {topServicesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topServicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "rgba(26,26,46,0.95)" : "rgba(255,255,255,0.95)",
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      color: isDark ? "#fff" : "#111",
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${formatCurrency(Number(value ?? 0))} ₺`, t.revenue]}
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {topServicesData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex h-[280px] items-center justify-center ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.noData}</div>
            )}
          </div>
        )}
      </section>

      {/* ── Row 4: Today's Schedule Table ───────────────────────────────── */}
      <section className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} backdrop-blur-sm`}>
        <div className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-4`}>
          <h2 className={`text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
            {t.todaySchedule}
          </h2>
        </div>
        {data.todaySchedule.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <th className="px-6 py-3">{t.time}</th>
                  <th className="px-6 py-3">{t.customer}</th>
                  <th className="px-6 py-3">{t.treatment}</th>
                  <th className="px-6 py-3">{t.staff}</th>
                  <th className="px-6 py-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                {data.todaySchedule.map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || "#6b7280";
                  const statusLabel = language === "tr" ? (STATUS_TR[apt.status] || apt.status) : apt.status;
                  return (
                    <tr key={apt.id} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                      <td className={`px-6 py-3.5 text-sm ${isDark ? "text-white/80" : "text-gray-800"}`}>{apt.time}</td>
                      <td className={`px-6 py-3.5 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{apt.customerName}</td>
                      <td className={`px-6 py-3.5 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                        <span className="flex items-center gap-2">
                          {apt.treatmentColor && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: apt.treatmentColor }}
                            />
                          )}
                          {apt.treatmentName}
                        </span>
                      </td>
                      <td className={`px-6 py-3.5 ${isDark ? "text-white/60" : "text-gray-600"}`}>{apt.staffName}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`flex h-32 items-center justify-center ${isDark ? "text-white/30" : "text-gray-300"}`}>
            {t.noData}
          </div>
        )}
      </section>

      {/* ── Row 5: Top Staff (owner/admin only) ─────────────────────────── */}
      {isOwnerOrAdmin && data.topStaff.length > 0 && (
        <section className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 backdrop-blur-sm`}>
          <h2 className={`mb-4 text-sm font-semibold tracking-wider ${isDark ? "text-white/70" : "text-gray-700"}`}>
            {t.topStaff}
          </h2>
          <div className="space-y-3">
            {data.topStaff.map((staff, index) => {
              const maxAmount = data.topStaff[0]?.amountInTry || 1;
              const pct = (staff.amountInTry / maxAmount) * 100;
              const isFirst = index === 0;
              return (
                <div key={staff.label} className={`group rounded-xl p-3 transition ${isFirst ? isDark ? "bg-amber-500/8 border border-amber-500/20" : "bg-amber-50 border border-amber-200" : ""}`}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-2 ${isDark ? "text-white/80" : "text-gray-800"}`}>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow ${isFirst ? "ring-2 ring-amber-400/60" : ""}`}
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      >
                        {isFirst ? "👑" : index + 1}
                      </span>
                      <span className={isFirst ? "font-semibold" : ""}>{staff.label}</span>
                    </span>
                    <div className="text-right">
                      <span className={`font-semibold ${isFirst ? "text-amber-400" : isDark ? "text-white/60" : "text-gray-600"}`}>{formatCurrency(staff.amountInTry)} ₺</span>
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{staff.count} {t.appointments}</p>
                    </div>
                  </div>
                  <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isFirst ? "#f59e0b" : CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

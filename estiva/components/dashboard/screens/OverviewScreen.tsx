"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { tenantService } from "@/services/tenantService";
import type { TenantInfo } from "@/services/tenantService";
import type { DashboardSummary } from "@/types/api";
import toast from "react-hot-toast";
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
    todayAppointments: "Today's Appointments",
    monthRevenue: "This Month Revenue",
    totalCustomers: "Total Customers",
    activePackages: "Active Packages",
    upcoming: "upcoming",
    revenueExpenseTrend: "Revenue & Expense Trend",
    appointmentStatus: "Appointment Status",
    customerGrowth: "Customer Growth",
    topServicesRevenue: "Top Services by Revenue",
    todaySchedule: "Today's Schedule",
    quickStats: "Quick Stats",
    revenue: "Revenue",
    expense: "Expense",
    newCustomers: "New Customers",
    totalCust: "Total",
    noData: "No data available",
    loading: "Loading...",
    time: "Time",
    customer: "Customer",
    treatment: "Treatment",
    staff: "Staff",
    status: "Status",
    thisWeek: "This Week",
    thisMonth: "This Month",
    netProfit: "Net Profit",
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No Show",
    topStaff: "Top Staff by Revenue",
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  tr: {
    welcome: "Tekrar hoş geldiniz",
    todayAppointments: "Bugünün Randevuları",
    monthRevenue: "Bu Ay Gelir",
    totalCustomers: "Toplam Müşteri",
    activePackages: "Aktif Paketler",
    upcoming: "yaklaşan",
    revenueExpenseTrend: "Gelir & Gider Trendi",
    appointmentStatus: "Randevu Durumu",
    customerGrowth: "Müşteri Büyümesi",
    topServicesRevenue: "Gelire Göre En İyi Hizmetler",
    todaySchedule: "Bugünün Programı",
    quickStats: "Hızlı İstatistikler",
    revenue: "Gelir",
    expense: "Gider",
    newCustomers: "Yeni Müşteri",
    totalCust: "Toplam",
    noData: "Veri bulunamadı",
    loading: "Yükleniyor...",
    time: "Saat",
    customer: "Müşteri",
    treatment: "Hizmet",
    staff: "Personel",
    status: "Durum",
    thisWeek: "Bu Hafta",
    thisMonth: "Bu Ay",
    netProfit: "Net Kar",
    scheduled: "Planlandı",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal",
    noShow: "Gelmedi",
    topStaff: "Gelire Göre En İyi Personel",
    monthNames: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
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
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/5 ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm ${className}`}>
      <Skeleton className="mb-6 h-5 w-48" />
      <Skeleton className="h-[280px] w-full" />
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
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a2e]/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="mb-1 text-xs font-medium text-white/60">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)} TL
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
  const { user } = useAuth();
  const t = copy[language];

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
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
      const [res, tenantRes] = await Promise.allSettled([
        dashboardService.getSummary(),
        tenantService.getTenantInfo(),
      ]);
      if (res.status === "fulfilled" && res.value.data.success && res.value.data.data) {
        setData(res.value.data.data);
      }
      if (tenantRes.status === "fulfilled" && tenantRes.value.data.success && tenantRes.value.data.data) {
        setTenantInfo(tenantRes.value.data.data);
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
      <div className="space-y-6 text-white">
        {/* Welcome skeleton */}
        <div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-8 w-72" />
        </div>
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        {/* Charts row 1 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartSkeleton className="lg:col-span-2" />
          <ChartSkeleton />
        </div>
        {/* Charts row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-white/60">
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
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      gradient: "from-pink-500/20 to-purple-500/20",
      iconColor: "text-pink-400",
    },
    {
      label: t.monthRevenue,
      value: `${formatCurrency(data.thisMonthRevenue)} TL`,
      sub: `${t.thisWeek}: ${formatCurrency(data.thisWeekRevenue)} TL`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500/20 to-cyan-500/20",
      iconColor: "text-emerald-400",
      visible: isOwnerOrAdmin,
    },
    {
      label: t.totalCustomers,
      value: data.totalCustomers.toString(),
      sub: "",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: t.activePackages,
      value: data.activePackages.toString(),
      sub: "",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
  ].filter((c) => c.visible !== false);

  const netProfit = data.thisMonthRevenue - data.thisMonthExpense;

  return (
    <div className="space-y-6 text-white">
      {/* ── Row 0: Welcome ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {tenantInfo?.companyName && (
            <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd1dc] to-[#f3a4ff]">
              {tenantInfo.companyName}
            </p>
          )}
          <p className="text-sm text-white/50">{t.welcome},</p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {user?.name} {user?.surname}
          </h1>
        </div>
        <p className="text-sm text-white/40">{todayStr}</p>
      </div>

      {/* ── Row 1: Stat Cards ───────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.07]`}
          >
            {/* gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                  {card.label}
                </p>
                <span className={`${card.iconColor}`}>{card.icon}</span>
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              {card.sub && (
                <p className="mt-1 text-xs text-white/40">{card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ── Net Profit banner (owner/admin only) ────────────────────────── */}
      {isOwnerOrAdmin && (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 px-6 py-4 backdrop-blur-sm">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">{t.netProfit} ({t.thisMonth})</p>
            <p className={`mt-1 text-2xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)} TL
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-white/40">{t.revenue}</p>
              <p className="font-semibold text-emerald-400">{formatCurrency(data.thisMonthRevenue)} TL</p>
            </div>
            <div>
              <p className="text-white/40">{t.expense}</p>
              <p className="font-semibold text-red-400">{formatCurrency(data.thisMonthExpense)} TL</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 2: Revenue Trend + Pie ──────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Revenue/Expense Line Chart */}
        {isOwnerOrAdmin && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
              {t.revenueExpenseTrend}
            </h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                  <Line type="monotone" dataKey={t.revenue} stroke="#ec4899" strokeWidth={2.5} dot={{ fill: "#ec4899", r: 4 }} activeDot={{ r: 6, fill: "#ec4899" }} />
                  <Line type="monotone" dataKey={t.expense} stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6, fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-white/30">{t.noData}</div>
            )}
          </div>
        )}

        {/* Appointment Status Pie/Donut Chart */}
        <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm ${!isOwnerOrAdmin ? "lg:col-span-3" : ""}`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
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
                    backgroundColor: "rgba(26,26,46,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                  formatter={(value: string) => <span className="text-white/60">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-white/30">{t.noData}</div>
          )}
        </div>
      </section>

      {/* ── Row 3: Customer Growth + Top Services ───────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Customer Growth Bar Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            {t.customerGrowth}
          </h2>
          {customerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                <Bar dataKey={t.newCustomers} fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t.totalCust} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-white/30">{t.noData}</div>
          )}
        </div>

        {/* Top Services Horizontal Bar */}
        {isOwnerOrAdmin && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
              {t.topServicesRevenue}
            </h2>
            {topServicesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topServicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(26,26,46,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${formatCurrency(Number(value ?? 0))} TL`, t.revenue]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {topServicesData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-white/30">{t.noData}</div>
            )}
          </div>
        )}
      </section>

      {/* ── Row 4: Today's Schedule Table ───────────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            {t.todaySchedule}
          </h2>
        </div>
        {data.todaySchedule.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-6 py-3">{t.time}</th>
                  <th className="px-6 py-3">{t.customer}</th>
                  <th className="px-6 py-3">{t.treatment}</th>
                  <th className="px-6 py-3">{t.staff}</th>
                  <th className="px-6 py-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.todaySchedule.map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || "#6b7280";
                  const statusLabel = language === "tr" ? (STATUS_TR[apt.status] || apt.status) : apt.status;
                  return (
                    <tr key={apt.id} className="transition hover:bg-white/5">
                      <td className="px-6 py-3.5 font-mono text-sm text-white/80">{apt.time}</td>
                      <td className="px-6 py-3.5 font-medium text-white">{apt.customerName}</td>
                      <td className="px-6 py-3.5 text-white/60">
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
                      <td className="px-6 py-3.5 text-white/60">{apt.staffName}</td>
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
          <div className="flex h-32 items-center justify-center text-white/30">
            {t.noData}
          </div>
        )}
      </section>

      {/* ── Row 5: Top Staff (owner/admin only) ─────────────────────────── */}
      {isOwnerOrAdmin && data.topStaff.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            {t.topStaff}
          </h2>
          <div className="space-y-3">
            {data.topStaff.map((staff, index) => {
              const maxAmount = data.topStaff[0]?.amountInTry || 1;
              const pct = (staff.amountInTry / maxAmount) * 100;
              return (
                <div key={staff.label} className="group">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/80">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      >
                        {index + 1}
                      </span>
                      {staff.label}
                    </span>
                    <span className="font-semibold text-white/60">{formatCurrency(staff.amountInTry)} TL</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
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

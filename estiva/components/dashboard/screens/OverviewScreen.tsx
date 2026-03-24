"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { appointmentService } from "@/services/appointmentService";
import { financialReportService } from "@/services/financialReportService";
import { customerService } from "@/services/customerService";
import type { AppointmentListItem, FinancialDashboard, CustomerListItem } from "@/types/api";
import toast from "react-hot-toast";

const STATUS_MAP: Record<string, { en: string; tr: string; color: string }> = {
  Scheduled: { en: "Scheduled", tr: "Planlandı", color: "bg-blue-500/10 text-blue-400" },
  Confirmed: { en: "Confirmed", tr: "Onaylandı", color: "bg-green-500/10 text-green-400" },
  Completed: { en: "Completed", tr: "Tamamlandı", color: "bg-emerald-500/10 text-emerald-400" },
  Cancelled: { en: "Cancelled", tr: "İptal", color: "bg-red-500/10 text-red-400" },
  NoShow: { en: "No Show", tr: "Gelmedi", color: "bg-yellow-500/10 text-yellow-400" },
};

const copy = {
  en: {
    salonSummary: "Salon summary",
    overview: "Overview",
    tabs: ["Today's Appointments", "Recent Customers"],
    stats: {
      revenue: "Total Revenue",
      expenses: "Total Expenses",
      profit: "Net Profit",
      todayAppointments: "Today's Appointments",
    },
    headers: {
      appointments: ["Time", "Client", "Treatment", "Staff", "Status"],
      customers: ["Name", "Phone", "Email", "Registered"],
    },
    loading: "Loading...",
    noData: "No data available.",
    currency: "TRY",
  },
  tr: {
    salonSummary: "Salon özeti",
    overview: "Özet",
    tabs: ["Bugünün Randevuları", "Son Müşteriler"],
    stats: {
      revenue: "Toplam Gelir",
      expenses: "Toplam Gider",
      profit: "Net Kar",
      todayAppointments: "Bugünün Randevuları",
    },
    headers: {
      appointments: ["Saat", "Müşteri", "Hizmet", "Personel", "Durum"],
      customers: ["Ad Soyad", "Telefon", "E-posta", "Kayıt Tarihi"],
    },
    loading: "Yükleniyor...",
    noData: "Veri yok.",
    currency: "TRY",
  },
};

export default function OverviewScreen() {
  const { language } = useLanguage();
  const text = copy[language];
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentListItem[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<CustomerListItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, apptRes, custRes] = await Promise.allSettled([
        financialReportService.dashboard(),
        appointmentService.getToday(),
        customerService.list(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.data.success && dashRes.value.data.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (apptRes.status === "fulfilled" && apptRes.value.data.success && apptRes.value.data.data) {
        setTodayAppointments(apptRes.value.data.data);
      }
      if (custRes.status === "fulfilled" && custRes.value.data.success && custRes.value.data.data) {
        setRecentCustomers(custRes.value.data.data.slice(0, 10));
      }
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statsCards = [
    {
      label: text.stats.revenue,
      value: dashboard ? `${formatCurrency(dashboard.totalRevenueTRY)} ${text.currency}` : "—",
      trend: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: text.stats.expenses,
      value: dashboard ? `${formatCurrency(dashboard.totalExpenseTRY)} ${text.currency}` : "—",
      trend: "bg-red-500/10 text-red-400",
    },
    {
      label: text.stats.profit,
      value: dashboard ? `${formatCurrency(dashboard.netIncomeTRY)} ${text.currency}` : "—",
      trend: dashboard && dashboard.netIncomeTRY >= 0
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-red-500/10 text-red-400",
    },
    {
      label: text.stats.todayAppointments,
      value: todayAppointments.length.toString(),
      trend: "bg-blue-500/10 text-blue-400",
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-white/60">{text.loading}</div>;
    }

    switch (activeTab) {
      case 0: // Today's appointments
        return todayAppointments.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-white/40">
                {text.headers.appointments.map((label) => (
                  <th key={label} className="px-6 py-4 uppercase tracking-wider">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todayAppointments.map((apt) => {
                const status = STATUS_MAP[apt.status] || STATUS_MAP["Scheduled"];
                return (
                  <tr key={apt.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 text-white/80">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {apt.customerFullName}
                    </td>
                    <td className="px-6 py-4 text-white/60">{apt.treatmentName}</td>
                    <td className="px-6 py-4 text-white/60">
                      {apt.staffFullName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                        {language === "tr" ? status.tr : status.en}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );

      case 1: // Recent customers
        return recentCustomers.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-white/40">
                {text.headers.customers.map((label) => (
                  <th key={label} className="px-6 py-4 uppercase tracking-wider">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentCustomers.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">{c.name} {c.surname}</td>
                  <td className="px-6 py-4 text-white/60">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-white/60">{c.email || "—"}</td>
                  <td className="px-6 py-4 text-white/60">{c.lastAppointmentDate ? formatDate(c.lastAppointmentDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
          {text.salonSummary}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{text.overview}</h1>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(4,2,12,0.6)]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      {/* Tabs & Content */}
      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(3,2,9,0.65)]">
        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-6 py-4">
          {text.tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === index
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">{renderContent()}</div>
      </section>
    </div>
  );
}

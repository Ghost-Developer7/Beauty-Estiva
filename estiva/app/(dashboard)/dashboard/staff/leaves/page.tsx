"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import { staffLeaveService } from "@/services/staffLeaveService";
import { staffService, type StaffMember } from "@/services/staffService";
import type { StaffLeaveListItem, StaffLeaveBalance } from "@/types/api";
import MonthCalendar, { type CalendarEvent } from "@/components/ui/MonthCalendar";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const LEAVE_TYPES = [
  { value: "Annual",   en: "Annual Leave",   tr: "Yıllık İzin",   color: "bg-blue-500/20 text-blue-300 border border-blue-500/25"   },
  { value: "Sick",     en: "Sick Leave",      tr: "Hastalık İzni", color: "bg-red-500/20 text-red-300 border border-red-500/25"       },
  { value: "Maternity",en: "Maternity Leave", tr: "Doğum İzni",    color: "bg-pink-500/20 text-pink-300 border border-pink-500/25"   },
  { value: "Unpaid",   en: "Unpaid Leave",    tr: "Ücretsiz İzin", color: "bg-amber-500/20 text-amber-300 border border-amber-500/25"},
  { value: "Other",    en: "Other",           tr: "Diğer",         color: "bg-white/10 text-white/60 border border-white/10"         },
];

const STATUS_CONFIG: Record<string, { en: string; tr: string; color: string }> = {
  Pending:  { en: "Pending",  tr: "Beklemede", color: "bg-amber-500/15 text-amber-400"  },
  Approved: { en: "Approved", tr: "Onaylandı", color: "bg-emerald-500/15 text-emerald-400" },
  Rejected: { en: "Rejected", tr: "Reddedildi",color: "bg-red-500/15 text-red-400"     },
};

const MONTH_NAMES: Record<string, string[]> = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
};

const DAY_LABELS_EN: [string,string,string,string,string,string,string] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_LABELS_TR: [string,string,string,string,string,string,string] = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

const copy = {
  en: {
    title: "Leave Management",
    subtitle: "Manage staff leave requests and balances",
    loading: "Loading...",
    noData: "No leave requests found.",
    newLeave: "+ New Leave Request",
    staff: "Staff",
    type: "Type",
    dates: "Dates",
    duration: "Duration",
    status: "Status",
    reason: "Reason",
    actions: "Actions",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    days: "days",
    day: "day",
    create: "Create",
    creating: "Creating...",
    startDate: "Start Date",
    endDate: "End Date",
    selectStaff: "Select staff",
    selectType: "Select type",
    reasonPlaceholder: "Reason (optional)...",
    leaveBalances: "Leave Balances",
    entitlement: "Entitlement",
    used: "Used",
    pending: "Pending",
    remaining: "Remaining",
    all: "All",
    approveConfirm: "Approve this leave request?",
    rejectConfirm: "Reject this leave request?",
    deleteConfirm: "Delete this leave request?",
    approved: "Leave approved",
    rejected: "Leave rejected",
    deleted: "Leave deleted",
    created: "Leave request created",
    viewList: "List",
    viewCalendar: "Calendar",
    today: "Today",
    cancel: "Cancel",
  },
  tr: {
    title: "İzin Yönetimi",
    subtitle: "Personel izin talepleri ve bakiyeleri",
    loading: "Yükleniyor...",
    noData: "İzin talebi bulunamadı.",
    newLeave: "+ Yeni İzin Talebi",
    staff: "Personel",
    type: "Tür",
    dates: "Tarihler",
    duration: "Süre",
    status: "Durum",
    reason: "Sebep",
    actions: "İşlemler",
    approve: "Onayla",
    reject: "Reddet",
    delete: "Sil",
    days: "gün",
    day: "gün",
    create: "Oluştur",
    creating: "Oluşturuluyor...",
    startDate: "Başlangıç Tarihi",
    endDate: "Bitiş Tarihi",
    selectStaff: "Personel seçin",
    selectType: "Tür seçin",
    reasonPlaceholder: "Sebep (isteğe bağlı)...",
    leaveBalances: "İzin Bakiyeleri",
    entitlement: "Hak",
    used: "Kullanılan",
    pending: "Bekleyen",
    remaining: "Kalan",
    all: "Tümünü",
    approveConfirm: "Bu izin talebini onaylamak istiyor musunuz?",
    rejectConfirm: "Bu izin talebini reddetmek istiyor musunuz?",
    deleteConfirm: "Bu izin talebini silmek istiyor musunuz?",
    approved: "İzin onaylandı",
    rejected: "İzin reddedildi",
    deleted: "İzin silindi",
    created: "İzin talebi oluşturuldu",
    viewList: "Liste",
    viewCalendar: "Takvim",
    today: "Bugün",
    cancel: "İptal",
  },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

function toDateStr(d: string) {
  return d.slice(0, 10); // "YYYY-MM-DD"
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function StaffLeavesPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const t = copy[language];

  const isOwnerOrAdmin =
    user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const today = new Date();
  const [leaves, setLeaves] = useState<StaffLeaveListItem[]>([]);
  const [balances, setBalances] = useState<StaffLeaveBalance[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Form state
  const [formStaffId, setFormStaffId] = useState<number | undefined>(undefined);
  const [formType, setFormType] = useState("Annual");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;

      const leavesRes = await staffLeaveService.list(params);
      if (leavesRes.data.success && leavesRes.data.data)
        setLeaves(leavesRes.data.data);

      if (isOwnerOrAdmin) {
        const [balancesRes, staffRes] = await Promise.allSettled([
          staffLeaveService.getBalances(),
          staffService.list(),
        ]);
        if (balancesRes.status === "fulfilled" && balancesRes.value.data.success && balancesRes.value.data.data)
          setBalances(balancesRes.value.data.data);
        if (staffRes.status === "fulfilled" && staffRes.value.data.success && staffRes.value.data.data)
          setStaffList(staffRes.value.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, isOwnerOrAdmin, language]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Action handlers ── */

  const handleApprove = async (id: number) => {
    if (!confirm(t.approveConfirm)) return;
    try {
      await staffLeaveService.approve(id);
      toast.success(t.approved);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm(t.rejectConfirm)) return;
    try {
      await staffLeaveService.reject(id);
      toast.success(t.rejected);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await staffLeaveService.delete(id);
      toast.success(t.deleted);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    }
  };

  const handleCreate = async () => {
    if (!formStartDate || !formEndDate || !formType) return;
    setCreating(true);
    try {
      await staffLeaveService.create({
        staffId: formStaffId,
        startDate: formStartDate,
        endDate: formEndDate,
        leaveType: formType,
        reason: formReason || undefined,
      });
      toast.success(t.created);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormStaffId(undefined);
    setFormType("Annual");
    setFormStartDate("");
    setFormEndDate("");
    setFormReason("");
  };

  /* ── Helpers ── */

  const getLeaveTypeLabel = (type: string) => {
    const lt = LEAVE_TYPES.find((l) => l.value === type);
    return lt ? (language === "tr" ? lt.tr : lt.en) : type;
  };

  const getLeaveTypeColor = (type: string) =>
    LEAVE_TYPES.find((l) => l.value === type)?.color ?? "bg-white/10 text-white/60";

  const getStatusLabel = (status: string) => {
    const s = STATUS_CONFIG[status];
    return s ? (language === "tr" ? s.tr : s.en) : status;
  };

  const getStatusColor = (status: string) =>
    STATUS_CONFIG[status]?.color ?? "bg-white/10 text-white/60";

  /* ── Calendar events: map leaves to CalendarEvent[] ── */
  const calendarEvents: CalendarEvent[] = leaves.map((leave) => {
    const lt = LEAVE_TYPES.find((l) => l.value === leave.leaveType);
    return {
      id: leave.id,
      startDate: toDateStr(leave.startDate),
      endDate: toDateStr(leave.endDate),
      className: lt?.color,
      label: leave.staffFullName,
      meta: leave,
    };
  });

  /* ── Month navigation ── */
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };
  const goToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              {t.viewList}
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "calendar"
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {t.viewCalendar}
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            {t.newLeave}
          </button>
        </div>
      </div>

      {/* ── Leave Balances (Owner/Admin only) ── */}
      {isOwnerOrAdmin && balances.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            {t.leaveBalances}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {balances.map((b) => (
              <div
                key={b.staffId}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
              >
                <p className="truncate text-sm font-semibold text-white/90">{b.staffFullName}</p>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: t.entitlement, value: b.annualEntitlement, color: "text-white/80" },
                    { label: t.used,        value: b.usedDays,          color: "text-blue-400"    },
                    { label: t.pending,     value: b.pendingDays,       color: "text-amber-400"   },
                    { label: t.remaining,   value: b.remainingDays,     color: b.remainingDays > 0 ? "text-emerald-400" : "text-red-400" },
                  ].map((col) => (
                    <div key={col.label}>
                      <p className="text-[9px] text-white/25">{col.label}</p>
                      <p className={`text-sm font-bold ${col.color}`}>{col.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-white/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          {t.loading}
        </div>
      ) : viewMode === "calendar" ? (

        /* ══════════════════ CALENDAR VIEW ══════════════════ */
        <div className="space-y-4">
          {/* Month navigator */}
          <div className="flex items-center gap-1.5 self-start rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="min-w-[148px] text-center text-sm font-semibold">
              {MONTH_NAMES[language][calMonth]} {calYear}
            </span>
            <button
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button
              onClick={goToday}
              className="ml-1 rounded-lg border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
            >
              {t.today}
            </button>
          </div>

          <MonthCalendar
            year={calYear}
            month={calMonth}
            events={calendarEvents}
            dayLabels={language === "tr" ? DAY_LABELS_TR : DAY_LABELS_EN}
            minCellHeight={100}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {LEAVE_TYPES.map((lt) => (
              <span key={lt.value} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${lt.color}`}>
                {language === "tr" ? lt.tr : lt.en}
              </span>
            ))}
          </div>
        </div>

      ) : (

        /* ══════════════════ LIST VIEW ══════════════════ */
        <>
          {/* Status filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition"
            >
              <option value="" className="bg-[#1a1a2e]">{t.all}</option>
              <option value="Pending"  className="bg-[#1a1a2e]">{getStatusLabel("Pending")}</option>
              <option value="Approved" className="bg-[#1a1a2e]">{getStatusLabel("Approved")}</option>
              <option value="Rejected" className="bg-[#1a1a2e]">{getStatusLabel("Rejected")}</option>
            </select>
          </div>

          {leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16">
              <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              <p className="text-sm font-medium text-white/40">{t.noData}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {/* Table header */}
              <div className="hidden lg:grid grid-cols-[1fr_0.7fr_1fr_0.5fr_0.6fr_0.8fr] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                <span>{t.staff}</span>
                <span>{t.type}</span>
                <span>{t.dates}</span>
                <span>{t.duration}</span>
                <span>{t.status}</span>
                <span>{t.actions}</span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr_1fr_0.5fr_0.6fr_0.8fr] gap-2 lg:gap-4 items-center px-5 py-3.5 transition hover:bg-white/[0.03]"
                  >
                    <div className="text-sm font-semibold text-white/90">{leave.staffFullName}</div>

                    <div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getLeaveTypeColor(leave.leaveType)}`}>
                        {getLeaveTypeLabel(leave.leaveType)}
                      </span>
                    </div>

                    <div className="text-xs text-white/50">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </div>

                    <div className="text-xs text-white/50">
                      {leave.durationDays} {leave.durationDays === 1 ? t.day : t.days}
                    </div>

                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {leave.status === "Pending" && isOwnerOrAdmin && (
                        <>
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="rounded-lg bg-emerald-600/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-600/30"
                          >
                            {t.approve}
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            className="rounded-lg bg-red-600/20 px-2.5 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-600/30"
                          >
                            {t.reject}
                          </button>
                        </>
                      )}
                      {(leave.status === "Pending" || isOwnerOrAdmin) && (
                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/40 transition hover:bg-white/[0.1] hover:text-white/60"
                        >
                          {t.delete}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════ CREATE LEAVE MODAL ══════════════════ */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0e0b1a] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-5 py-4">
              <h2 className="text-base font-semibold text-white">{t.newLeave}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Staff selector */}
              {isOwnerOrAdmin && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.staff}</label>
                  <select
                    value={formStaffId ?? ""}
                    onChange={(e) => setFormStaffId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none"
                  >
                    <option value="" className="bg-[#1a1a2e] text-white/50">{t.selectStaff}</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#1a1a2e] text-white">
                        {s.name} {s.surname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Leave type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.type}</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none"
                >
                  {LEAVE_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value} className="bg-[#1a1a2e] text-white">
                      {language === "tr" ? lt.tr : lt.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.startDate}</label>
                  <LocaleDateInput
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    isDark={isDark}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.endDate}</label>
                  <LocaleDateInput
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    isDark={isDark}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.reason}</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={creating || !formStartDate || !formEndDate}
                className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating ? t.creating : t.create}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

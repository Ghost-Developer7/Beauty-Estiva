"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffLeaveService } from "@/services/staffLeaveService";
import { staffService, type StaffMember } from "@/services/staffService";
import type { StaffLeaveListItem, StaffLeaveBalance } from "@/types/api";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const LEAVE_TYPES = [
  { value: "Annual", en: "Annual Leave", tr: "Yıllık İzin", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  { value: "Sick", en: "Sick Leave", tr: "Hastalık İzni", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  { value: "Maternity", en: "Maternity Leave", tr: "Doğum İzni", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { value: "Unpaid", en: "Unpaid Leave", tr: "Ücretsiz İzin", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  { value: "Other", en: "Other", tr: "Diğer", color: "bg-white/10 text-white/60 border-white/10" },
];

const STATUS_CONFIG: Record<string, { en: string; tr: string; color: string }> = {
  Pending: { en: "Pending", tr: "Beklemede", color: "bg-amber-500/15 text-amber-400" },
  Approved: { en: "Approved", tr: "Onaylandı", color: "bg-emerald-500/15 text-emerald-400" },
  Rejected: { en: "Rejected", tr: "Reddedildi", color: "bg-red-500/15 text-red-400" },
};

const copy = {
  en: {
    title: "Leave Management",
    subtitle: "Manage staff leave requests and balances",
    loading: "Loading...",
    noData: "No leave requests found.",
    newLeave: "New Leave Request",
    staff: "Staff",
    type: "Type",
    dates: "Dates",
    duration: "Duration",
    status: "Status",
    reason: "Reason",
    actions: "Actions",
    approve: "Approve",
    reject: "Reject",
    cancel: "Cancel",
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
    approvedBy: "Approved by",
    leaveBalances: "Leave Balances",
    entitlement: "Entitlement",
    used: "Used",
    pending: "Pending",
    remaining: "Remaining",
    all: "All",
    filterStatus: "Filter by status",
    approveConfirm: "Approve this leave request?",
    rejectConfirm: "Reject this leave request?",
    deleteConfirm: "Delete this leave request?",
    approved: "Leave approved",
    rejected: "Leave rejected",
    deleted: "Leave deleted",
    created: "Leave request created",
  },
  tr: {
    title: "İzin Yönetimi",
    subtitle: "Personel izin talepleri ve bakiyeleri",
    loading: "Yükleniyor...",
    noData: "İzin talebi bulunamadı.",
    newLeave: "Yeni İzin Talebi",
    staff: "Personel",
    type: "Tür",
    dates: "Tarihler",
    duration: "Süre",
    status: "Durum",
    reason: "Sebep",
    actions: "İşlemler",
    approve: "Onayla",
    reject: "Reddet",
    cancel: "İptal",
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
    approvedBy: "Onaylayan",
    leaveBalances: "İzin Bakiyeleri",
    entitlement: "Hak",
    used: "Kullanılan",
    pending: "Bekleyen",
    remaining: "Kalan",
    all: "Tümünü",
    filterStatus: "Duruma göre filtrele",
    approveConfirm: "Bu izin talebini onaylamak istiyor musunuz?",
    rejectConfirm: "Bu izin talebini reddetmek istiyor musunuz?",
    deleteConfirm: "Bu izin talebini silmek istiyor musunuz?",
    approved: "İzin onaylandı",
    rejected: "İzin reddedildi",
    deleted: "İzin silindi",
    created: "İzin talebi oluşturuldu",
  },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

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

  const [leaves, setLeaves] = useState<StaffLeaveListItem[]>([]);
  const [balances, setBalances] = useState<StaffLeaveBalance[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

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
      const params: any = {};
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: number) => {
    if (!confirm(t.approveConfirm)) return;
    try {
      await staffLeaveService.approve(id);
      toast.success(t.approved);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm(t.rejectConfirm)) return;
    try {
      await staffLeaveService.reject(id);
      toast.success(t.rejected);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await staffLeaveService.delete(id);
      toast.success(t.deleted);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
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
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr?.response?.data?.error?.message || (language === "tr" ? "İşlem başarısız" : "Operation failed"));
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

  const getLeaveTypeLabel = (type: string) => {
    const lt = LEAVE_TYPES.find((l) => l.value === type);
    return lt ? (language === "tr" ? lt.tr : lt.en) : type;
  };

  const getLeaveTypeColor = (type: string) => {
    return LEAVE_TYPES.find((l) => l.value === type)?.color || "bg-white/10 text-white/60";
  };

  const getStatusLabel = (status: string) => {
    const s = STATUS_CONFIG[status];
    return s ? (language === "tr" ? s.tr : s.en) : status;
  };

  const getStatusColor = (status: string) => {
    return STATUS_CONFIG[status]?.color || "bg-white/10 text-white/60";
  };

  /* ═══ RENDER ═══ */

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${isDark ? "bg-violet-600 hover:bg-violet-500" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-200"}`}
        >
          + {t.newLeave}
        </button>
      </div>

      {/* Leave Balances (Owner/Admin only) */}
      {isOwnerOrAdmin && balances.length > 0 && (
        <div>
          <h2 className={`mb-3 text-sm font-semibold tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>
            {t.leaveBalances}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {balances.map((b) => (
              <div
                key={b.staffId}
                className={`rounded-xl border p-4 backdrop-blur-sm ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-gray-200 bg-white shadow-sm"}`}
              >
                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{b.staffFullName}</p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.entitlement}</p>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{b.annualEntitlement}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.used}</p>
                    <p className="text-sm font-bold text-blue-400">{b.usedDays}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.pending}</p>
                    <p className="text-sm font-bold text-amber-400">{b.pendingDays}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{t.remaining}</p>
                    <p className={`text-sm font-bold ${b.remainingDays > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {b.remainingDays}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${isDark ? "border-white/[0.08] bg-white/[0.03] text-white focus:border-white/20" : "border-gray-200 bg-white text-gray-900 focus:border-gray-400"}`}
        >
          <option value="" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{t.all}</option>
          <option value="Pending" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{getStatusLabel("Pending")}</option>
          <option value="Approved" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{getStatusLabel("Approved")}</option>
          <option value="Rejected" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{getStatusLabel("Rejected")}</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "border-gray-200 bg-white shadow-sm"}`}>
        {loading ? (
          <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
            {t.loading}
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className={isDark ? "text-white/20" : "text-gray-300"} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noData}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`hidden lg:grid grid-cols-[1fr_0.7fr_1fr_0.5fr_0.6fr_0.8fr] gap-4 border-b px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "border-white/[0.06] bg-white/[0.03] text-white/30" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
              <span>{t.staff}</span>
              <span>{t.type}</span>
              <span>{t.dates}</span>
              <span>{t.duration}</span>
              <span>{t.status}</span>
              <span>{t.actions}</span>
            </div>

            {/* Rows */}
            <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className={`grid grid-cols-1 lg:grid-cols-[1fr_0.7fr_1fr_0.5fr_0.6fr_0.8fr] gap-2 lg:gap-4 items-center px-5 py-3.5 transition-all duration-150 ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"}`}
                >
                  {/* Staff */}
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{leave.staffFullName}</div>

                  {/* Type */}
                  <div>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getLeaveTypeColor(leave.leaveType)}`}>
                      {getLeaveTypeLabel(leave.leaveType)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </div>

                  {/* Duration */}
                  <div className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>
                    {leave.durationDays} {leave.durationDays === 1 ? t.day : t.days}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(leave.status)}`}>
                      {getStatusLabel(leave.status)}
                    </span>
                  </div>

                  {/* Actions */}
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
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${isDark ? "bg-white/[0.05] text-white/40 hover:bg-white/[0.1] hover:text-white/60" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"}`}
                      >
                        {t.delete}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`border-t px-5 py-3 text-xs ${isDark ? "border-white/[0.06] bg-white/[0.03] text-white/40" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
              {leaves.length} {language === "tr" ? "kayıt" : "records"}
            </div>
          </>
        )}
      </div>

      {/* ═══ CREATE LEAVE MODAL ═══ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`w-full max-w-md mx-4 rounded-2xl border p-6 shadow-2xl ${isDark ? "border-white/10 bg-[#1a1a2e]" : "border-gray-200 bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.newLeave}</h2>
              <button
                onClick={() => setShowModal(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Staff Selector (Owner/Admin only) */}
              {isOwnerOrAdmin && (
                <div>
                  <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.staff}</label>
                  <select
                    value={formStaffId ?? ""}
                    onChange={(e) => setFormStaffId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${isDark ? "border-white/[0.1] bg-white/[0.05] text-white focus:border-white/20" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400"}`}
                  >
                    <option value="" className={isDark ? "bg-[#1a1a2e] text-white/50" : "bg-white text-gray-400"}>{t.selectStaff}</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id} className={isDark ? "bg-[#1a1a2e] text-white" : "bg-white text-gray-900"}>
                        {s.name} {s.surname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Leave Type */}
              <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.type}</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${isDark ? "border-white/[0.1] bg-white/[0.05] text-white focus:border-white/20" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400"}`}
                >
                  {LEAVE_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value} className={isDark ? "bg-[#1a1a2e] text-white" : "bg-white text-gray-900"}>
                      {language === "tr" ? lt.tr : lt.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.startDate}</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${isDark ? "border-white/[0.1] bg-white/[0.05] text-white focus:border-white/20" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400"}`}
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.endDate}</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${isDark ? "border-white/[0.1] bg-white/[0.05] text-white focus:border-white/20" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400"}`}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.reason}</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  rows={3}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none resize-none transition ${isDark ? "border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/30 focus:border-white/20" : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"}`}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={creating || !formStartDate || !formEndDate}
                className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? t.creating : t.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

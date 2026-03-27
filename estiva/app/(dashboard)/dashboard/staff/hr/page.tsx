"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffHRService } from "@/services/staffHRService";
import type { StaffHRSummary, StaffHRInfo, StaffHRInfoUpdate } from "@/types/api";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const ROLE_LABELS: Record<string, { en: string; tr: string; bg: string }> = {
  SuperAdmin: { en: "SuperAdmin", tr: "Süper Yönetici", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
  Owner: { en: "Owner", tr: "Sahip", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  Admin: { en: "Admin", tr: "Yönetici", bg: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  Staff: { en: "Staff", tr: "Personel", bg: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const copy = {
  en: {
    title: "HR Records",
    subtitle: "Staff personnel records and information",
    loading: "Loading...",
    noData: "No staff records found.",
    staffMember: "Staff Member",
    position: "Position",
    hireDate: "Hire Date",
    salary: "Salary",
    leaveBalance: "Leave Balance",
    roles: "Roles",
    edit: "Edit",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    saved: "Records updated successfully",
    // Detail fields
    positionLabel: "Position",
    hireDateLabel: "Hire Date",
    salaryLabel: "Salary",
    currencyLabel: "Currency",
    identityLabel: "Identity Number",
    emergencyName: "Emergency Contact Name",
    emergencyPhone: "Emergency Contact Phone",
    annualLeave: "Annual Leave Entitlement",
    usedLeave: "Used Leave",
    remainingLeave: "Remaining Leave",
    notes: "Notes",
    notesPlaceholder: "Notes...",
    daysUnit: "days",
    positionPlaceholder: "e.g. Hair Stylist",
    noPosition: "Not set",
    noHireDate: "Not set",
    total: "total",
  },
  tr: {
    title: "Özlük Bilgileri",
    subtitle: "Personel özlük bilgileri ve kayıtları",
    loading: "Yükleniyor...",
    noData: "Personel kaydı bulunamadı.",
    staffMember: "Personel",
    position: "Pozisyon",
    hireDate: "İşe Giriş",
    salary: "Maaş",
    leaveBalance: "İzin Bakiyesi",
    roles: "Roller",
    edit: "Düzenle",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    saved: "Kayıtlar güncellendi",
    positionLabel: "Pozisyon",
    hireDateLabel: "İşe Giriş Tarihi",
    salaryLabel: "Maaş",
    currencyLabel: "Para Birimi",
    identityLabel: "TC Kimlik No",
    emergencyName: "Acil Durum Kişisi",
    emergencyPhone: "Acil Durum Telefonu",
    annualLeave: "Yıllık İzin Hakkı",
    usedLeave: "Kullanılan İzin",
    remainingLeave: "Kalan İzin",
    notes: "Notlar",
    notesPlaceholder: "Notlar...",
    daysUnit: "gün",
    positionPlaceholder: "örn. Kuaför",
    noPosition: "Belirlenmemiş",
    noHireDate: "Belirlenmemiş",
    total: "toplam",
  },
};

const formatDate = (d: string | null) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

const AVATAR_COLORS = [
  "from-pink-500/40 to-rose-500/40",
  "from-violet-500/40 to-purple-500/40",
  "from-blue-500/40 to-indigo-500/40",
  "from-emerald-500/40 to-teal-500/40",
  "from-amber-500/40 to-orange-500/40",
  "from-cyan-500/40 to-sky-500/40",
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function StaffHRPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];

  const isOwnerOrAdmin =
    user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const [summaries, setSummaries] = useState<StaffHRSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editData, setEditData] = useState<StaffHRInfoUpdate>({});
  const [detailData, setDetailData] = useState<StaffHRInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isOwnerOrAdmin) {
        const res = await staffHRService.getSummary();
        if (res.data.success && res.data.data) setSummaries(res.data.data);
      } else if (user?.id) {
        const res = await staffHRService.getHRInfo(parseInt(user.id));
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setSummaries([
            {
              staffId: d.staffId,
              staffFullName: d.staffFullName,
              position: d.position,
              hireDate: d.hireDate,
              salary: d.salary,
              salaryCurrency: d.salaryCurrency,
              annualLeaveEntitlement: d.annualLeaveEntitlement,
              usedLeaveDays: d.usedLeaveDays,
              remainingLeaveDays: d.remainingLeaveDays,
              roles: [],
            },
          ]);
        }
      }
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isOwnerOrAdmin, user, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditing = async (staffId: number) => {
    try {
      const res = await staffHRService.getHRInfo(staffId);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setDetailData(d);
        setEditData({
          hireDate: d.hireDate || undefined,
          position: d.position || undefined,
          salary: d.salary || undefined,
          salaryCurrency: d.salaryCurrency || "TRY",
          identityNumber: d.identityNumber || undefined,
          emergencyContactName: d.emergencyContactName || undefined,
          emergencyContactPhone: d.emergencyContactPhone || undefined,
          annualLeaveEntitlement: d.annualLeaveEntitlement,
          notes: d.notes || undefined,
        });
        setEditingStaffId(staffId);
      }
    } catch {
      toast.error(language === "tr" ? "Bilgiler yüklenemedi" : "Failed to load details");
    }
  };

  const handleSave = async () => {
    if (!editingStaffId) return;
    setSaving(true);
    try {
      await staffHRService.updateHRInfo(editingStaffId, editData);
      toast.success(t.saved);
      setEditingStaffId(null);
      setDetailData(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = summaries.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.staffFullName.toLowerCase().includes(q) ||
      s.position?.toLowerCase().includes(q)
    );
  });

  /* ═══ RENDER ═══ */

  return (
    <div className="space-y-5 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === "tr" ? "Personel ara..." : "Search staff..."}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
        />
      </div>

      {/* HR Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <p className="text-sm font-medium text-white/40">{t.noData}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden lg:grid grid-cols-[1fr_0.7fr_0.6fr_0.7fr_0.8fr_0.5fr] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold tracking-wider text-white/30">
              <span>{t.staffMember}</span>
              <span>{t.position}</span>
              <span>{t.hireDate}</span>
              <span>{t.salary}</span>
              <span>{t.leaveBalance}</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((s) => {
                const avatarColor = AVATAR_COLORS[s.staffId % AVATAR_COLORS.length];
                const initials = s.staffFullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={s.staffId}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr_0.6fr_0.7fr_0.8fr_0.5fr] gap-2 lg:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04]"
                  >
                    {/* Staff */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-xs font-bold text-white shadow-sm`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{s.staffFullName}</p>
                        <div className="mt-0.5 flex gap-1">
                          {s.roles.map((r) => (
                            <span
                              key={r}
                              className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${
                                ROLE_LABELS[r]?.bg || "bg-white/10 text-white/60"
                              }`}
                            >
                              {language === "tr" ? ROLE_LABELS[r]?.tr || r : ROLE_LABELS[r]?.en || r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Position */}
                    <div className="text-xs text-white/60">
                      {s.position || (
                        <span className="text-white/25 italic">{t.noPosition}</span>
                      )}
                    </div>

                    {/* Hire Date */}
                    <div className="text-xs text-white/60">
                      {formatDate(s.hireDate) || (
                        <span className="text-white/25 italic">{t.noHireDate}</span>
                      )}
                    </div>

                    {/* Salary */}
                    <div className="text-xs">
                      {s.salary != null ? (
                        <span className="font-semibold text-emerald-400">
                          {s.salary.toLocaleString("tr-TR")} {s.salaryCurrency}
                        </span>
                      ) : (
                        <span className="text-white/25">--</span>
                      )}
                    </div>

                    {/* Leave Balance */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                          style={{
                            width: `${Math.min(100, ((s.usedLeaveDays) / Math.max(1, s.annualLeaveEntitlement)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 whitespace-nowrap">
                        {s.remainingLeaveDays}/{s.annualLeaveEntitlement}
                      </span>
                    </div>

                    {/* Edit */}
                    {isOwnerOrAdmin && (
                      <div>
                        <button
                          onClick={() => startEditing(s.staffId)}
                          className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold text-white/50 transition hover:bg-white/[0.1] hover:text-white"
                        >
                          {t.edit}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] bg-white/[0.03] px-5 py-3 text-xs text-white/40">
              {filtered.length} {t.total}
            </div>
          </>
        )}
      </div>

      {/* ═══ EDIT MODAL ═══ */}
      {editingStaffId && detailData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setEditingStaffId(null);
            setDetailData(null);
          }}
        >
          <div
            className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {detailData.staffFullName} - {t.title}
              </h2>
              <button
                onClick={() => {
                  setEditingStaffId(null);
                  setDetailData(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Position */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.positionLabel}</label>
                <input
                  type="text"
                  value={editData.position || ""}
                  onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                  placeholder={t.positionPlaceholder}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Hire Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.hireDateLabel}</label>
                <input
                  type="date"
                  value={editData.hireDate ? editData.hireDate.split("T")[0] : ""}
                  onChange={(e) => setEditData({ ...editData, hireDate: e.target.value || null })}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Salary + Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.salaryLabel}</label>
                  <input
                    type="number"
                    value={editData.salary ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, salary: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.currencyLabel}</label>
                  <select
                    value={editData.salaryCurrency || "TRY"}
                    onChange={(e) => setEditData({ ...editData, salaryCurrency: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="TRY" className="bg-[#1a1a2e]">₺ TL</option>
                    <option value="USD" className="bg-[#1a1a2e]">USD</option>
                    <option value="EUR" className="bg-[#1a1a2e]">EUR</option>
                    <option value="GBP" className="bg-[#1a1a2e]">GBP</option>
                  </select>
                </div>
              </div>

              {/* Identity Number */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.identityLabel}</label>
                <input
                  type="text"
                  value={editData.identityNumber || ""}
                  onChange={(e) => setEditData({ ...editData, identityNumber: e.target.value })}
                  maxLength={11}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.emergencyName}</label>
                  <input
                    type="text"
                    value={editData.emergencyContactName || ""}
                    onChange={(e) => setEditData({ ...editData, emergencyContactName: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.emergencyPhone}</label>
                  <input
                    type="tel"
                    value={editData.emergencyContactPhone || ""}
                    onChange={(e) => setEditData({ ...editData, emergencyContactPhone: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              {/* Annual Leave */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.annualLeave}</label>
                  <input
                    type="number"
                    value={editData.annualLeaveEntitlement ?? 14}
                    onChange={(e) =>
                      setEditData({ ...editData, annualLeaveEntitlement: parseInt(e.target.value) || 14 })
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.usedLeave}</label>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white/50">
                    {detailData.usedLeaveDays} {t.daysUnit}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.remainingLeave}</label>
                  <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm font-semibold ${
                    detailData.remainingLeaveDays > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {detailData.remainingLeaveDays} {t.daysUnit}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">{t.notes}</label>
                <textarea
                  value={editData.notes || ""}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingStaffId(null);
                    setDetailData(null);
                  }}
                  className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.05] py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.1]"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                >
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

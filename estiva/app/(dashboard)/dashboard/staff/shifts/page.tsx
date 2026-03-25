"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffShiftService } from "@/services/staffShiftService";
import { staffService, type StaffMember } from "@/services/staffService";
import type { StaffWeeklyShift, StaffShiftUpsert } from "@/types/api";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const DAY_LABELS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  tr: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
};

const DAY_SHORT = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
};

const copy = {
  en: {
    title: "Shift Management",
    subtitle: "Weekly work schedule for all staff",
    loading: "Loading...",
    noData: "No staff members found.",
    save: "Save",
    saving: "Saving...",
    saveAll: "Save All Changes",
    saved: "Shifts saved successfully",
    startTime: "Start",
    endTime: "End",
    breakStart: "Break Start",
    breakEnd: "Break End",
    workingDay: "Working Day",
    dayOff: "Day Off",
    edit: "Edit",
    cancel: "Cancel",
    resetDefaults: "Set Default Schedule",
    defaultApplied: "Default schedule applied",
    staffMember: "Staff Member",
  },
  tr: {
    title: "Vardiya Yönetimi",
    subtitle: "Tüm personel için haftalık çalışma programı",
    loading: "Yükleniyor...",
    noData: "Personel bulunamadı.",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saveAll: "Tüm Değişiklikleri Kaydet",
    saved: "Vardiyalar başarıyla kaydedildi",
    startTime: "Başlangıç",
    endTime: "Bitiş",
    breakStart: "Mola Baş.",
    breakEnd: "Mola Bit.",
    workingDay: "Çalışma Günü",
    dayOff: "Tatil",
    edit: "Düzenle",
    cancel: "İptal",
    resetDefaults: "Varsayılan Program Uygula",
    defaultApplied: "Varsayılan program uygulandı",
    staffMember: "Personel",
  },
};

const DEFAULT_SHIFT: StaffShiftUpsert = {
  dayOfWeek: 0,
  startTime: "09:00",
  endTime: "18:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  isWorkingDay: true,
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

export default function StaffShiftsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];

  const isOwnerOrAdmin =
    user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  const [weeklyData, setWeeklyData] = useState<StaffWeeklyShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editShifts, setEditShifts] = useState<StaffShiftUpsert[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isOwnerOrAdmin) {
        const res = await staffShiftService.getWeeklyView();
        if (res.data.success && res.data.data) setWeeklyData(res.data.data);
      } else if (user?.id) {
        const res = await staffShiftService.getStaffShifts(parseInt(user.id));
        if (res.data.success && res.data.data) {
          setWeeklyData([
            {
              staffId: parseInt(user.id),
              staffFullName: `${user.name} ${user.surname}`,
              shifts: res.data.data,
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

  const startEditing = (staffId: number, currentShifts: StaffWeeklyShift) => {
    const shifts: StaffShiftUpsert[] = [];
    for (let day = 0; day < 7; day++) {
      const existing = currentShifts.shifts.find((s) => s.dayOfWeek === day);
      if (existing) {
        shifts.push({
          dayOfWeek: day,
          startTime: existing.startTime,
          endTime: existing.endTime,
          breakStartTime: existing.breakStartTime,
          breakEndTime: existing.breakEndTime,
          isWorkingDay: existing.isWorkingDay,
        });
      } else {
        shifts.push({
          ...DEFAULT_SHIFT,
          dayOfWeek: day,
          isWorkingDay: day !== 0, // Sunday off by default
        });
      }
    }
    setEditingStaffId(staffId);
    setEditShifts(shifts);
  };

  const updateEditShift = (day: number, field: string, value: any) => {
    setEditShifts((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = async (staffId: number) => {
    setSaving(true);
    try {
      await staffShiftService.updateStaffShifts(staffId, { shifts: editShifts });
      toast.success(t.saved);
      setEditingStaffId(null);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Kaydetme hatası" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const applyDefaults = () => {
    const defaults: StaffShiftUpsert[] = [];
    for (let day = 0; day < 7; day++) {
      defaults.push({
        ...DEFAULT_SHIFT,
        dayOfWeek: day,
        isWorkingDay: day !== 0, // Sunday off
      });
    }
    setEditShifts(defaults);
    toast.success(t.defaultApplied);
  };

  /* ═══ RENDER ═══ */

  return (
    <div className="space-y-5 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-white/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          {t.loading}
        </div>
      ) : weeklyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12">
          <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          <p className="text-sm font-medium text-white/40">{t.noData}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weeklyData.map((staffWeek) => {
            const isEditing = editingStaffId === staffWeek.staffId;
            const avatarColor = AVATAR_COLORS[staffWeek.staffId % AVATAR_COLORS.length];
            const initials = staffWeek.staffFullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={staffWeek.staffId}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                {/* Staff Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-xs font-bold text-white`}
                    >
                      {initials}
                    </div>
                    <span className="text-sm font-semibold">{staffWeek.staffFullName}</span>
                  </div>
                  {isOwnerOrAdmin && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={applyDefaults}
                            className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/[0.1]"
                          >
                            {t.resetDefaults}
                          </button>
                          <button
                            onClick={() => setEditingStaffId(null)}
                            className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/[0.1]"
                          >
                            {t.cancel}
                          </button>
                          <button
                            onClick={() => handleSave(staffWeek.staffId)}
                            disabled={saving}
                            className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                          >
                            {saving ? t.saving : t.save}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(staffWeek.staffId, staffWeek)}
                          className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/[0.1]"
                        >
                          {t.edit}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Shift Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] font-semibold tracking-wider text-white/30">
                        <th className="px-4 py-2 text-left w-24">{t.staffMember}</th>
                        {DAY_SHORT[language].map((d, i) => (
                          <th key={i} className="px-2 py-2 text-center">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="divide-x divide-white/[0.04]">
                        <td className="px-4 py-3 text-xs text-white/40 font-medium align-top">
                          {language === "tr" ? "Program" : "Schedule"}
                        </td>
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          if (isEditing) {
                            const shift = editShifts.find((s) => s.dayOfWeek === dayIdx);
                            if (!shift) return <td key={dayIdx} />;
                            return (
                              <td key={dayIdx} className="px-2 py-2 align-top">
                                <div className="space-y-1.5">
                                  {/* Working Day Toggle */}
                                  <button
                                    onClick={() =>
                                      updateEditShift(dayIdx, "isWorkingDay", !shift.isWorkingDay)
                                    }
                                    className={`w-full rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                                      shift.isWorkingDay
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                    }`}
                                  >
                                    {shift.isWorkingDay ? t.workingDay : t.dayOff}
                                  </button>

                                  {shift.isWorkingDay && (
                                    <>
                                      <div>
                                        <label className="text-[9px] text-white/30">{t.startTime}</label>
                                        <input
                                          type="time"
                                          value={shift.startTime}
                                          onChange={(e) =>
                                            updateEditShift(dayIdx, "startTime", e.target.value)
                                          }
                                          className="w-full rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-1 text-[11px] text-white focus:outline-none focus:border-white/20"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-white/30">{t.endTime}</label>
                                        <input
                                          type="time"
                                          value={shift.endTime}
                                          onChange={(e) =>
                                            updateEditShift(dayIdx, "endTime", e.target.value)
                                          }
                                          className="w-full rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-1 text-[11px] text-white focus:outline-none focus:border-white/20"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-white/30">{t.breakStart}</label>
                                        <input
                                          type="time"
                                          value={shift.breakStartTime || ""}
                                          onChange={(e) =>
                                            updateEditShift(
                                              dayIdx,
                                              "breakStartTime",
                                              e.target.value || null,
                                            )
                                          }
                                          className="w-full rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-1 text-[11px] text-white focus:outline-none focus:border-white/20"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-white/30">{t.breakEnd}</label>
                                        <input
                                          type="time"
                                          value={shift.breakEndTime || ""}
                                          onChange={(e) =>
                                            updateEditShift(
                                              dayIdx,
                                              "breakEndTime",
                                              e.target.value || null,
                                            )
                                          }
                                          className="w-full rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-1 text-[11px] text-white focus:outline-none focus:border-white/20"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // View mode
                          const shift = staffWeek.shifts.find((s) => s.dayOfWeek === dayIdx);
                          return (
                            <td key={dayIdx} className="px-2 py-3 text-center align-top">
                              {shift ? (
                                <div className="space-y-1">
                                  <span
                                    className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                                      shift.isWorkingDay
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                    }`}
                                  >
                                    {shift.isWorkingDay ? `${shift.startTime}-${shift.endTime}` : t.dayOff}
                                  </span>
                                  {shift.isWorkingDay && shift.breakStartTime && (
                                    <p className="text-[9px] text-white/30">
                                      {language === "tr" ? "Mola" : "Break"}: {shift.breakStartTime}-{shift.breakEndTime}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/20">--</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

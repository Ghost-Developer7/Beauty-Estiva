"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffShiftService } from "@/services/staffShiftService";
import type { StaffWeeklyShift, StaffShiftUpsert } from "@/types/api";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun

const DAY_LABEL: Record<string, Record<number, string>> = {
  en: { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" },
  tr: { 0: "Paz", 1: "Pzt", 2: "Sal", 3: "Çar", 4: "Per", 5: "Cum", 6: "Cmt" },
};

const MONTH_NAMES: Record<string, string[]> = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
};

const STAFF_COLORS = [
  { dot: "bg-violet-400",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300 border border-violet-500/25",  avatar: "from-violet-500 to-purple-600"  },
  { dot: "bg-emerald-400", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25", avatar: "from-emerald-500 to-teal-600"  },
  { dot: "bg-sky-400",     text: "text-sky-400",     badge: "bg-sky-500/20 text-sky-300 border border-sky-500/25",     avatar: "from-sky-500 to-blue-600"     },
  { dot: "bg-amber-400",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300 border border-amber-500/25",   avatar: "from-amber-500 to-orange-600" },
  { dot: "bg-rose-400",    text: "text-rose-400",    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/25",    avatar: "from-rose-500 to-red-600"     },
  { dot: "bg-cyan-400",    text: "text-cyan-400",    badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/25",    avatar: "from-cyan-500 to-sky-600"     },
  { dot: "bg-pink-400",    text: "text-pink-400",    badge: "bg-pink-500/20 text-pink-300 border border-pink-500/25",    avatar: "from-pink-500 to-rose-600"    },
  { dot: "bg-lime-400",    text: "text-lime-400",    badge: "bg-lime-500/20 text-lime-300 border border-lime-500/25",    avatar: "from-lime-500 to-green-600"   },
];

const DEFAULT_SHIFT: Omit<StaffShiftUpsert, "dayOfWeek"> = {
  startTime: "09:00",
  endTime: "18:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  isWorkingDay: true,
};

const copy = {
  en: {
    title: "Shift Management",
    subtitle: "Monthly calendar overview with staff schedules",
    loading: "Loading...",
    noData: "No staff members found.",
    save: "Save",
    saving: "Saving...",
    saved: "Shifts saved successfully",
    breakLabel: "Break",
    workingDay: "Working",
    dayOff: "Off",
    edit: "Edit Schedule",
    cancel: "Cancel",
    resetDefaults: "Apply Default",
    defaultApplied: "Default schedule applied",
    start: "Start",
    end: "End",
    breakStart: "Break",
    breakEnd: "End",
    allStaff: "All Staff",
    workingDays: "working days",
    totalHours: "total hrs",
    editScheduleFor: "Editing schedule for",
    summaryTitle: "Monthly Summary",
    today: "Today",
  },
  tr: {
    title: "Vardiya Yönetimi",
    subtitle: "Aylık takvim görünümü ve personel programları",
    loading: "Yükleniyor...",
    noData: "Personel bulunamadı.",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Vardiyalar başarıyla kaydedildi",
    breakLabel: "Mola",
    workingDay: "Çalışıyor",
    dayOff: "Tatil",
    edit: "Programı Düzenle",
    cancel: "İptal",
    resetDefaults: "Varsayılan Uygula",
    defaultApplied: "Varsayılan program uygulandı",
    start: "Başlangıç",
    end: "Bitiş",
    breakStart: "Mola Baş.",
    breakEnd: "Mola Bit.",
    allStaff: "Tüm Personel",
    workingDays: "çalışma günü",
    totalHours: "toplam saat",
    editScheduleFor: "Program düzenleniyor:",
    summaryTitle: "Aylık Özet",
    today: "Bugün",
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function toHHMM(value: string | Date | null | undefined): string {
  if (!value) return "";
  const str = String(value);
  if (/^\d{2}:\d{2}/.test(str)) return str.slice(0, 5);
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime()))
      return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  } catch { /* ignore */ }
  return "";
}

function hhmmToMinutes(value: string | null | undefined): number {
  const s = toHHMM(value);
  if (!s) return 0;
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Returns grid rows of day-numbers (null = padding) for a given month, Mon-Sun columns */
function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function calcMonthStats(staffWeek: StaffWeeklyShift, year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  let totalMinutes = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const jsDay = new Date(year, month, d).getDay();
    const shift = staffWeek.shifts.find((s) => s.dayOfWeek === jsDay);
    if (shift?.isWorkingDay) {
      workingDays++;
      const start = hhmmToMinutes(shift.startTime);
      const end = hhmmToMinutes(shift.endTime);
      const bStart = hhmmToMinutes(shift.breakStartTime);
      const bEnd = hhmmToMinutes(shift.breakEndTime);
      const breakMins = bStart && bEnd && bEnd > bStart ? bEnd - bStart : 0;
      totalMinutes += Math.max(0, end - start - breakMins);
    }
  }
  return {
    workingDays,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
  };
}

function staffInitials(fullName: string): string {
  return (fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function StaffShiftsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];
  const today = new Date();

  const isOwnerOrAdmin =
    user?.roles?.includes("Owner") || user?.roles?.includes("Admin");

  // ── State ──
  const [weeklyData, setWeeklyData] = useState<StaffWeeklyShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedIds, setSelectedIds] = useState<Set<number> | null>(null); // null = all
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editShifts, setEditShifts] = useState<StaffShiftUpsert[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Data fetching ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isOwnerOrAdmin) {
        const res = await staffShiftService.getWeeklyView();
        if (res.data.success && res.data.data) setWeeklyData(res.data.data);
      } else if (user?.id) {
        const res = await staffShiftService.getStaffShifts(parseInt(user.id));
        if (res.data.success && res.data.data) {
          setWeeklyData([{
            staffId: parseInt(user.id),
            staffFullName: `${user.name} ${user.surname}`,
            shifts: res.data.data,
          }]);
        }
      }
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isOwnerOrAdmin, user, language]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived ──
  const filteredData =
    selectedIds === null
      ? weeklyData
      : weeklyData.filter((s) => selectedIds.has(s.staffId));

  const colorOf = (staffId: number) =>
    STAFF_COLORS[weeklyData.findIndex((s) => s.staffId === staffId) % STAFF_COLORS.length];

  const calGrid = getCalendarGrid(calYear, calMonth);

  // ── Month navigation ──
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };
  const goToday = () => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); };

  // ── Staff filter toggle ──
  const toggleStaff = (staffId: number) => {
    setSelectedIds((prev) => {
      const current =
        prev === null
          ? new Set(weeklyData.map((s) => s.staffId))
          : new Set(prev);
      if (current.has(staffId)) {
        current.delete(staffId);
        if (current.size === 0) return new Set([staffId]); // keep at least one
      } else {
        current.add(staffId);
        if (current.size === weeklyData.length) return null; // all = null
      }
      return current;
    });
  };

  // ── Edit handlers ──
  const startEditing = (staffWeek: StaffWeeklyShift) => {
    const shifts: StaffShiftUpsert[] = WEEK_ORDER.map((day) => {
      const ex = staffWeek.shifts.find((s) => s.dayOfWeek === day);
      return ex
        ? {
            dayOfWeek: day,
            startTime: toHHMM(ex.startTime),
            endTime: toHHMM(ex.endTime),
            breakStartTime: toHHMM(ex.breakStartTime) || null,
            breakEndTime: toHHMM(ex.breakEndTime) || null,
            isWorkingDay: ex.isWorkingDay,
          }
        : { ...DEFAULT_SHIFT, dayOfWeek: day, isWorkingDay: day !== 0 };
    });
    setEditShifts(shifts);
    setEditingStaffId(staffWeek.staffId);
    // Scroll to bottom to show edit panel
    setTimeout(() => window.scrollBy({ top: 400, behavior: "smooth" }), 50);
  };

  const updateShift = (day: number, field: string, value: unknown) =>
    setEditShifts((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s)),
    );

  const applyDefaults = () => {
    setEditShifts((prev) =>
      prev.map((s) => ({ ...DEFAULT_SHIFT, dayOfWeek: s.dayOfWeek, isWorkingDay: s.dayOfWeek !== 0 })),
    );
    toast.success(t.defaultApplied);
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

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-5 text-white">

      {/* ─── Page header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
        </div>

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
      </div>

      {/* ─── Loading / empty ─── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-white/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          {t.loading}
        </div>
      ) : weeklyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16">
          <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          <p className="text-sm text-white/40">{t.noData}</p>
        </div>
      ) : (
        <>
          {/* ─── Staff filter chips ─── */}
          {isOwnerOrAdmin && weeklyData.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {/* All button */}
              <button
                onClick={() => setSelectedIds(null)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedIds === null
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:bg-white/[0.07] hover:text-white/60"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                {t.allStaff}
              </button>

              {/* Individual staff chips */}
              {weeklyData.map((sw, idx) => {
                const color = STAFF_COLORS[idx % STAFF_COLORS.length];
                const isSelected = selectedIds === null || selectedIds.has(sw.staffId);
                return (
                  <button
                    key={sw.staffId}
                    onClick={() => toggleStaff(sw.staffId)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-white/15 bg-white/[0.07] text-white/80"
                        : "border-white/[0.06] bg-white/[0.02] text-white/25 hover:bg-white/[0.05] hover:text-white/45"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${color.dot} ${isSelected ? "" : "opacity-25"}`} />
                    {sw.staffFullName}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Monthly summary cards ─── */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">
              {t.summaryTitle} — {MONTH_NAMES[language][calMonth]} {calYear}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {filteredData.map((sw) => {
                const color = colorOf(sw.staffId);
                const stats = calcMonthStats(sw, calYear, calMonth);
                const initials = staffInitials(sw.staffFullName);
                return (
                  <div
                    key={sw.staffId}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color.avatar} text-[11px] font-bold text-white shadow`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold leading-tight text-white/80">
                        {sw.staffFullName}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[11px] font-semibold ${color.text}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                          {stats.workingDays} {t.workingDays}
                        </span>
                        <span className="text-white/15">·</span>
                        <span className={`flex items-center gap-1 text-[11px] font-semibold ${color.text}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                          {stats.totalHours} {t.totalHours}
                        </span>
                      </div>
                    </div>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={() => startEditing(sw)}
                        className="ml-1 shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-white/30 transition hover:bg-white/[0.08] hover:text-white/70"
                        title={t.edit}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Monthly Calendar ─── */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.3)]">

            {/* Day-of-week header */}
            <div className="grid grid-cols-7 divide-x divide-white/[0.04] border-b border-white/[0.06] bg-white/[0.03]">
              {WEEK_ORDER.map((day) => (
                <div
                  key={day}
                  className={`py-2.5 text-center text-[11px] font-bold tracking-widest ${
                    day === 0 || day === 6 ? "text-amber-400/55" : "text-white/30"
                  }`}
                >
                  {DAY_LABEL[language][day]}
                </div>
              ))}
            </div>

            {/* Calendar rows */}
            {calGrid.map((week, wIdx) => (
              <div
                key={wIdx}
                className="grid grid-cols-7 divide-x divide-white/[0.04] border-b border-white/[0.04] last:border-b-0"
              >
                {week.map((day, dIdx) => {
                  const calDayOfWeek = WEEK_ORDER[dIdx]; // JS dayOfWeek for this column
                  const isWeekend = calDayOfWeek === 0 || calDayOfWeek === 6;
                  const isToday =
                    day !== null &&
                    calYear === today.getFullYear() &&
                    calMonth === today.getMonth() &&
                    day === today.getDate();
                  const isPast =
                    day !== null &&
                    new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  return (
                    <div
                      key={dIdx}
                      className={`min-h-[100px] p-2 ${isWeekend ? "bg-white/[0.012]" : ""} ${isPast && day !== null ? "opacity-60" : ""}`}
                    >
                      {/* Day number */}
                      <div className="mb-1.5">
                        {day !== null ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold leading-none ${
                              isToday
                                ? "bg-violet-500 text-white shadow-[0_0_0_3px_rgba(139,92,246,0.25)]"
                                : isWeekend
                                ? "text-amber-400/50"
                                : "text-white/35"
                            }`}
                          >
                            {day}
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6" />
                        )}
                      </div>

                      {/* Staff shift badges */}
                      {day !== null && (
                        <div className="space-y-1">
                          {filteredData.map((sw) => {
                            const shift = sw.shifts.find((s) => s.dayOfWeek === calDayOfWeek);
                            if (!shift) return null;
                            const color = colorOf(sw.staffId);

                            if (!shift.isWorkingDay) {
                              // Only show "Off" badge if single staff selected (less noise in multi-staff view)
                              if (filteredData.length > 1) return null;
                              return (
                                <div key={sw.staffId} className="w-full truncate rounded px-1.5 py-0.5 text-[9px] font-medium border border-red-500/15 bg-red-500/10 text-red-400/70">
                                  {t.dayOff}
                                </div>
                              );
                            }

                            const start = toHHMM(shift.startTime);
                            const end = toHHMM(shift.endTime);
                            return (
                              <div
                                key={sw.staffId}
                                title={`${sw.staffFullName} · ${start} – ${end}`}
                                className={`w-full truncate rounded px-1.5 py-0.5 text-[9px] font-medium leading-snug ${color.badge}`}
                              >
                                {filteredData.length > 1 && (
                                  <span className="mr-0.5 opacity-70">
                                    {sw.staffFullName.split(" ")[0].slice(0, 5)}
                                    {" "}
                                  </span>
                                )}
                                {start}–{end}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ─── Edit Panel (inline, shown when editing) ─── */}
          {editingStaffId !== null && (() => {
            const staffWeek = weeklyData.find((s) => s.staffId === editingStaffId);
            if (!staffWeek) return null;
            const color = colorOf(editingStaffId);
            return (
              <div className="overflow-hidden rounded-2xl border border-violet-500/25 bg-white/[0.02] shadow-[0_8px_40px_rgba(139,92,246,0.12)]">

                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color.avatar} text-[11px] font-bold text-white shadow`}>
                      {staffInitials(staffWeek.staffFullName)}
                    </div>
                    <div>
                      <p className="text-[11px] text-white/35">{t.editScheduleFor}</p>
                      <p className="text-sm font-semibold leading-tight">{staffWeek.staffFullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={applyDefaults}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.08] hover:text-white/70"
                    >
                      {t.resetDefaults}
                    </button>
                    <button
                      onClick={() => setEditingStaffId(null)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.08] hover:text-white/70"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => handleSave(editingStaffId)}
                      disabled={saving}
                      className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-violet-500 disabled:opacity-40"
                    >
                      {saving ? t.saving : t.save}
                    </button>
                  </div>
                </div>

                {/* 7-column day grid */}
                <div className="grid grid-cols-7 divide-x divide-white/[0.04]">
                  {WEEK_ORDER.map((dayIdx) => {
                    const isWeekend = dayIdx === 0 || dayIdx === 6;
                    const shift = editShifts.find((s) => s.dayOfWeek === dayIdx);
                    if (!shift) return <div key={dayIdx} />;
                    return (
                      <div key={dayIdx} className={`p-2.5 ${isWeekend ? "bg-white/[0.015]" : ""}`}>
                        {/* Day label */}
                        <div className="mb-2 text-center">
                          <span className={`text-[10px] font-bold tracking-wider ${isWeekend ? "text-amber-400/70" : "text-white/35"}`}>
                            {DAY_LABEL[language][dayIdx]}
                          </span>
                        </div>

                        {/* Working / Off toggle */}
                        <button
                          onClick={() => updateShift(dayIdx, "isWorkingDay", !shift.isWorkingDay)}
                          className={`mb-2.5 w-full rounded-lg py-1 text-[10px] font-semibold transition ${
                            shift.isWorkingDay
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          }`}
                        >
                          {shift.isWorkingDay ? t.workingDay : t.dayOff}
                        </button>

                        {shift.isWorkingDay && (
                          <div className="space-y-1.5">
                            <div>
                              <p className="mb-0.5 text-[9px] text-white/25">{t.start}</p>
                              <input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => updateShift(dayIdx, "startTime", e.target.value)}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-1.5 py-1.5 text-[11px] text-white focus:border-violet-500/50 focus:outline-none"
                              />
                            </div>
                            <div>
                              <p className="mb-0.5 text-[9px] text-white/25">{t.end}</p>
                              <input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => updateShift(dayIdx, "endTime", e.target.value)}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-1.5 py-1.5 text-[11px] text-white focus:border-violet-500/50 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1.5">
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                                {t.breakLabel}
                              </p>
                              <div>
                                <p className="mb-0.5 text-[9px] text-white/20">{t.breakStart}</p>
                                <input
                                  type="time"
                                  value={shift.breakStartTime || ""}
                                  onChange={(e) => updateShift(dayIdx, "breakStartTime", e.target.value || null)}
                                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-1.5 py-1 text-[11px] text-white/70 focus:border-violet-500/50 focus:outline-none"
                                />
                              </div>
                              <div>
                                <p className="mb-0.5 text-[9px] text-white/20">{t.breakEnd}</p>
                                <input
                                  type="time"
                                  value={shift.breakEndTime || ""}
                                  onChange={(e) => updateShift(dayIdx, "breakEndTime", e.target.value || null)}
                                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-1.5 py-1 text-[11px] text-white/70 focus:border-violet-500/50 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

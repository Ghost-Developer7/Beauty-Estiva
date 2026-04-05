"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffShiftService } from "@/services/staffShiftService";
import type { StaffWeeklyShift, StaffShiftUpsert, StaffShiftOverride } from "@/types/api";
import MonthCalendar, { type CalendarEvent } from "@/components/ui/MonthCalendar";
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
    dayOverride: "Day Override",
    dayOverrideDesc: "Override shift for this specific date",
    revertDefault: "Revert to Default",
    selectStaff: "Select Staff",
    overrideSaved: "Day override saved",
    overrideReverted: "Reverted to default shift",
    overrideExists: "(custom)",
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
    dayOverride: "Günlük Düzenleme",
    dayOverrideDesc: "Bu güne özel vardiya düzenle",
    revertDefault: "Varsayılana Dön",
    selectStaff: "Personel Seçin",
    overrideSaved: "Günlük vardiya kaydedildi",
    overrideReverted: "Varsayılan vardiyaya dönüldü",
    overrideExists: "(özel)",
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

function calcMonthStats(staffWeek: StaffWeeklyShift, year: number, month: number, staffOverrides?: StaffShiftOverride[]) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  let totalMinutes = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const override = staffOverrides?.find((o) => o.date === dateStr);
    if (override) {
      if (override.isWorkingDay) {
        workingDays++;
        const start = hhmmToMinutes(override.startTime);
        const end = hhmmToMinutes(override.endTime);
        const bStart = hhmmToMinutes(override.breakStartTime);
        const bEnd = hhmmToMinutes(override.breakEndTime);
        const breakMins = bStart && bEnd && bEnd > bStart ? bEnd - bStart : 0;
        totalMinutes += Math.max(0, end - start - breakMins);
      }
      continue;
    }
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const [cardOrder, setCardOrder] = useState<number[]>([]); // staffIds in priority order (last clicked first)
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editShifts, setEditShifts] = useState<StaffShiftUpsert[]>([]);
  const [saving, setSaving] = useState(false);
  // Day override state
  const [overrides, setOverrides] = useState<Map<number, StaffShiftOverride[]>>(new Map());
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [dayModalStaffId, setDayModalStaffId] = useState<number | null>(null);
  const [dayForm, setDayForm] = useState({ startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00", isWorkingDay: true });
  const [daySaving, setDaySaving] = useState(false);

  // ── Fetch overrides for current month ──
  const fetchOverrides = useCallback(async (staffList: StaffWeeklyShift[]) => {
    const map = new Map<number, StaffShiftOverride[]>();
    const year = calYear;
    const month = calMonth + 1;
    const results = await Promise.allSettled(
      staffList.map((sw) => staffShiftService.getOverrides(sw.staffId, year, month))
    );
    results.forEach((res, i) => {
      if (res.status === "fulfilled" && res.value.data.success && res.value.data.data) {
        map.set(staffList[i].staffId, res.value.data.data);
      }
    });
    setOverrides(map);
  }, [calYear, calMonth]);

  // ── Data fetching ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let staffList: StaffWeeklyShift[] = [];
      if (isOwnerOrAdmin) {
        const res = await staffShiftService.getWeeklyView();
        if (res.data.success && res.data.data) {
          staffList = res.data.data;
          setWeeklyData(staffList);
        }
      } else if (user?.id) {
        const res = await staffShiftService.getStaffShifts(parseInt(user.id));
        if (res.data.success && res.data.data) {
          staffList = [{
            staffId: parseInt(user.id),
            staffFullName: `${user.name} ${user.surname}`,
            shifts: res.data.data,
          }];
          setWeeklyData(staffList);
        }
      }
      if (staffList.length > 0) fetchOverrides(staffList);
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isOwnerOrAdmin, user, language, fetchOverrides]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refetch overrides when month changes
  useEffect(() => {
    if (weeklyData.length > 0) fetchOverrides(weeklyData);
  }, [calYear, calMonth, fetchOverrides, weeklyData]);

  // ── Derived ──
  const filteredData = (() => {
    const base = selectedIds === null
      ? weeklyData
      : weeklyData.filter((s) => selectedIds.has(s.staffId));
    if (cardOrder.length === 0) return base;
    return [...base].sort((a, b) => {
      const ai = cardOrder.indexOf(a.staffId);
      const bi = cardOrder.indexOf(b.staffId);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return 1;
      return ai - bi;
    });
  })();

  const bringCardToFront = (staffId: number) => {
    setCardOrder((prev) => [staffId, ...prev.filter((id) => id !== staffId)]);
  };

  const colorOf = (staffId: number) =>
    STAFF_COLORS[weeklyData.findIndex((s) => s.staffId === staffId) % STAFF_COLORS.length];

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
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
          {/* ─── Toolbar: filter chips + month summary label ─── */}
          {isOwnerOrAdmin && weeklyData.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-widest text-white/20">
                {t.allStaff}
              </span>
              {/* All button */}
              <button
                onClick={() => setSelectedIds(null)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  selectedIds === null
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/[0.07] text-white/35 hover:bg-white/[0.05] hover:text-white/60"
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Tümü
              </button>
              <span className="h-4 w-px bg-white/10" />
              {weeklyData.map((sw, idx) => {
                const color = STAFF_COLORS[idx % STAFF_COLORS.length];
                const isSelected = selectedIds === null || selectedIds.has(sw.staffId);
                return (
                  <button
                    key={sw.staffId}
                    onClick={() => toggleStaff(sw.staffId)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                      isSelected
                        ? "border-white/15 bg-white/[0.06] text-white/80"
                        : "border-white/[0.05] text-white/20 hover:text-white/45"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot} ${isSelected ? "" : "opacity-20"}`} />
                    {sw.staffFullName}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Monthly summary cards ─── */}
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/25">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {t.summaryTitle} — {MONTH_NAMES[language][calMonth]} {calYear}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {filteredData.map((sw) => {
                const color = colorOf(sw.staffId);
                const stats = calcMonthStats(sw, calYear, calMonth, overrides.get(sw.staffId));
                const initials = staffInitials(sw.staffFullName);
                const maxDays = new Date(calYear, calMonth + 1, 0).getDate();
                const dayPct = maxDays > 0 ? Math.round((stats.workingDays / maxDays) * 100) : 0;
                return (
                  <div
                    key={sw.staffId}
                    onClick={() => bringCardToFront(sw.staffId)}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.05] min-w-[300px] shrink-0 cursor-pointer"
                  >
                    {/* Top row: avatar + name + edit */}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color.avatar} text-[12px] font-bold text-white shadow-lg`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white/90">{sw.staffFullName}</p>
                        <p className={`text-[10px] font-medium ${color.text} opacity-60`}>{MONTH_NAMES[language][calMonth]}</p>
                      </div>
                      {isOwnerOrAdmin && (
                        <button
                          onClick={() => startEditing(sw)}
                          className="shrink-0 rounded-lg border border-white/[0.08] p-1.5 text-white/25 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white/70"
                          title={t.edit}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <svg className={color.text} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        <span className="text-xs font-bold text-white/80">{stats.workingDays}</span>
                        <span className="text-[10px] text-white/30">{t.workingDays}</span>
                      </div>
                      <div className="h-3 w-px bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <svg className={color.text} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="text-xs font-bold text-white/80">{stats.totalHours}</span>
                        <span className="text-[10px] text-white/30">{t.totalHours}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${color.avatar} transition-all duration-700`}
                          style={{ width: `${dayPct}%`, opacity: 0.7 }}
                        />
                      </div>
                      <p className="mt-1 text-right text-[10px] text-white/20">{dayPct}% aktif</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Month navigator ─── */}
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

          {/* ─── Monthly Calendar (shared MonthCalendar component) ─── */}
          {(() => {
            // Build CalendarEvent[] from weekly shift data + overrides
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const shiftEvents: CalendarEvent[] = [];
            for (const sw of filteredData) {
              const color = colorOf(sw.staffId);
              const staffOvr = overrides.get(sw.staffId) || [];
              for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const override = staffOvr.find((o) => o.date === dateStr);
                const jsDay = new Date(calYear, calMonth, d).getDay();
                const shift = sw.shifts.find((s) => s.dayOfWeek === jsDay);

                const isWorking = override ? override.isWorkingDay : shift?.isWorkingDay;
                const startTime = override ? override.startTime : shift?.startTime;
                const endTime = override ? override.endTime : shift?.endTime;
                const isOverridden = !!override;

                if (!isWorking) {
                  if (filteredData.length === 1) {
                    shiftEvents.push({
                      id: `off-${sw.staffId}-${dateStr}`,
                      startDate: dateStr,
                      className: isOverridden
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-400/70"
                        : "border border-red-500/15 bg-red-500/10 text-red-400/70",
                      label: isOverridden ? `${t.dayOff} ✎` : t.dayOff,
                    });
                  }
                  continue;
                }
                if (!shift && !override) continue;
                const start = toHHMM(startTime);
                const end = toHHMM(endTime);
                const badgeClass = isOverridden
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : color.badge;
                shiftEvents.push({
                  id: `${sw.staffId}-${dateStr}`,
                  startDate: dateStr,
                  className: badgeClass,
                  label: filteredData.length > 1
                    ? `${sw.staffFullName.split(" ")[0]}${isOverridden ? " ✎" : ""}`
                    : `${start}–${end}${isOverridden ? " ✎" : ""}`,
                  sublabel: filteredData.length > 1 ? `${start}–${end}` : undefined,
                  meta: { staffId: sw.staffId },
                });
              }
            }
            const dayLabels = language === "tr"
              ? ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"] as [string,string,string,string,string,string,string]
              : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as [string,string,string,string,string,string,string];
            return (
              <MonthCalendar
                year={calYear}
                month={calMonth}
                events={shiftEvents}
                dayLabels={dayLabels}
                minCellHeight={100}
                onDayClick={isOwnerOrAdmin ? (dateStr) => {
                  setDayModalDate(dateStr);
                  // If only one staff filtered, pre-select them
                  if (filteredData.length === 1) {
                    setDayModalStaffId(filteredData[0].staffId);
                    const jsDay = new Date(dateStr).getDay();
                    const staffOvr = overrides.get(filteredData[0].staffId) || [];
                    const override = staffOvr.find((o) => o.date === dateStr);
                    const shift = filteredData[0].shifts.find((s) => s.dayOfWeek === jsDay);
                    setDayForm({
                      startTime: toHHMM(override?.startTime ?? shift?.startTime) || "09:00",
                      endTime: toHHMM(override?.endTime ?? shift?.endTime) || "18:00",
                      breakStartTime: toHHMM(override?.breakStartTime ?? shift?.breakStartTime) || "12:00",
                      breakEndTime: toHHMM(override?.breakEndTime ?? shift?.breakEndTime) || "13:00",
                      isWorkingDay: override ? override.isWorkingDay : (shift?.isWorkingDay ?? true),
                    });
                  } else {
                    setDayModalStaffId(null);
                  }
                } : undefined}
              />
            );
          })()}

        </>
      )}

      {/* ─── Day Override Modal ─── */}
      {dayModalDate && isOwnerOrAdmin && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDayModalDate(null); }}
        >
          <div className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.3)] ${
            isDark ? "border-amber-500/25 bg-[#0e0b1a]" : "border-purple-200 bg-white"
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b px-5 py-4 ${
              isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-purple-100 bg-purple-50/50"
            }`}>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "" : "text-gray-900"}`}>{t.dayOverride}</p>
                <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  {new Date(dayModalDate + "T12:00:00").toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setDayModalDate(null)} className={isDark ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Staff selector (if multiple staff) */}
              {filteredData.length > 1 && (
                <div>
                  <p className={`mb-1.5 text-[10px] ${isDark ? "text-white/30" : "text-gray-500"}`}>{t.selectStaff}</p>
                  <select
                    value={dayModalStaffId ?? ""}
                    onChange={(e) => {
                      const sid = parseInt(e.target.value);
                      setDayModalStaffId(sid);
                      const sw = weeklyData.find((s) => s.staffId === sid);
                      if (sw) {
                        const jsDay = new Date(dayModalDate + "T12:00:00").getDay();
                        const staffOvr = overrides.get(sid) || [];
                        const override = staffOvr.find((o) => o.date === dayModalDate);
                        const shift = sw.shifts.find((s) => s.dayOfWeek === jsDay);
                        setDayForm({
                          startTime: toHHMM(override?.startTime ?? shift?.startTime) || "09:00",
                          endTime: toHHMM(override?.endTime ?? shift?.endTime) || "18:00",
                          breakStartTime: toHHMM(override?.breakStartTime ?? shift?.breakStartTime) || "12:00",
                          breakEndTime: toHHMM(override?.breakEndTime ?? shift?.breakEndTime) || "13:00",
                          isWorkingDay: override ? override.isWorkingDay : (shift?.isWorkingDay ?? true),
                        });
                      }
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`}
                  >
                    <option value="">{t.selectStaff}...</option>
                    {filteredData.map((sw) => (
                      <option key={sw.staffId} value={sw.staffId}>{sw.staffFullName}</option>
                    ))}
                  </select>
                </div>
              )}

              {dayModalStaffId && (
                <>
                  {/* Working / Off toggle */}
                  <button
                    onClick={() => setDayForm((p) => ({ ...p, isWorkingDay: !p.isWorkingDay }))}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                      dayForm.isWorkingDay
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    }`}
                  >
                    {dayForm.isWorkingDay ? t.workingDay : t.dayOff}
                  </button>

                  {dayForm.isWorkingDay && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-[10px] text-white/30">{t.start}</p>
                        <input type="time" value={dayForm.startTime} onChange={(e) => setDayForm((p) => ({ ...p, startTime: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`} />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] text-white/30">{t.end}</p>
                        <input type="time" value={dayForm.endTime} onChange={(e) => setDayForm((p) => ({ ...p, endTime: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`} />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] text-white/30">{t.breakStart}</p>
                        <input type="time" value={dayForm.breakStartTime} onChange={(e) => setDayForm((p) => ({ ...p, breakStartTime: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`} />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] text-white/30">{t.breakEnd}</p>
                        <input type="time" value={dayForm.breakEndTime} onChange={(e) => setDayForm((p) => ({ ...p, breakEndTime: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    {(overrides.get(dayModalStaffId) || []).some((o) => o.date === dayModalDate) && (
                      <button
                        onClick={async () => {
                          setDaySaving(true);
                          try {
                            await staffShiftService.deleteOverride(dayModalStaffId!, dayModalDate!);
                            toast.success(t.overrideReverted);
                            setDayModalDate(null);
                            fetchOverrides(weeklyData);
                          } catch { toast.error("Error"); }
                          finally { setDaySaving(false); }
                        }}
                        disabled={daySaving}
                        className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] disabled:opacity-40"
                      >
                        {t.revertDefault}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setDaySaving(true);
                        try {
                          await staffShiftService.upsertOverride(dayModalStaffId!, {
                            date: dayModalDate!,
                            startTime: dayForm.startTime,
                            endTime: dayForm.endTime,
                            breakStartTime: dayForm.breakStartTime || null,
                            breakEndTime: dayForm.breakEndTime || null,
                            isWorkingDay: dayForm.isWorkingDay,
                          });
                          toast.success(t.overrideSaved);
                          setDayModalDate(null);
                          fetchOverrides(weeklyData);
                        } catch { toast.error("Error"); }
                        finally { setDaySaving(false); }
                      }}
                      disabled={daySaving}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-900/50 disabled:opacity-40"
                    >
                      {daySaving ? t.saving : t.save}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Edit Modal Overlay ─── */}
      {editingStaffId !== null && (() => {
        const staffWeek = weeklyData.find((s) => s.staffId === editingStaffId);
        if (!staffWeek) return null;
        const color = colorOf(editingStaffId);
        return createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.65)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditingStaffId(null); }}
          >
            <div className={`w-full max-w-5xl overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.3)] ${
              isDark
                ? "border-violet-500/25 bg-[#0e0b1a]"
                : "border-purple-200 bg-white"
            }`}>

              {/* Modal header */}
              <div className={`flex items-center justify-between border-b px-5 py-4 ${
                isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-purple-100 bg-purple-50/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color.avatar} text-[12px] font-bold text-white shadow`}>
                    {staffInitials(staffWeek.staffFullName)}
                  </div>
                  <div>
                    <p className={`text-[11px] ${isDark ? "text-white/35" : "text-gray-500"}`}>{t.editScheduleFor}</p>
                    <p className={`text-sm font-semibold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{staffWeek.staffFullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={applyDefaults}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${isDark ? "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70" : "border-purple-200 bg-purple-50 text-gray-600 hover:bg-purple-100"}`}
                  >
                    {t.resetDefaults}
                  </button>
                  <button
                    onClick={() => setEditingStaffId(null)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${isDark ? "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70" : "border-purple-200 bg-purple-50 text-gray-600 hover:bg-purple-100"}`}
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
              <div className={`grid grid-cols-7 divide-x ${isDark ? "divide-white/[0.04]" : "divide-purple-100"}`}>
                {WEEK_ORDER.map((dayIdx) => {
                  const isWeekend = dayIdx === 0 || dayIdx === 6;
                  const shift = editShifts.find((s) => s.dayOfWeek === dayIdx);
                  if (!shift) return <div key={dayIdx} />;
                  return (
                    <div key={dayIdx} className={`p-3 ${isWeekend ? (isDark ? "bg-white/[0.015]" : "bg-purple-50/50") : ""}`}>
                      {/* Day label */}
                      <div className="mb-2 text-center">
                        <span className={`text-[10px] font-bold tracking-wider ${isWeekend ? "text-amber-400/70" : (isDark ? "text-white/35" : "text-gray-400")}`}>
                          {DAY_LABEL[language][dayIdx]}
                        </span>
                      </div>

                      {/* Working / Off toggle */}
                      <button
                        onClick={() => updateShift(dayIdx, "isWorkingDay", !shift.isWorkingDay)}
                        className={`mb-3 w-full rounded-lg py-1.5 text-[10px] font-semibold transition ${
                          shift.isWorkingDay
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                        }`}
                      >
                        {shift.isWorkingDay ? t.workingDay : t.dayOff}
                      </button>

                      {shift.isWorkingDay && (
                        <div className="space-y-2">
                          <div>
                            <p className={`mb-1 text-[9px] ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.start}</p>
                            <input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) => updateShift(dayIdx, "startTime", e.target.value)}
                              className={`w-full rounded-lg border px-2 py-1.5 text-[11px] focus:border-violet-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`}
                            />
                          </div>
                          <div>
                            <p className={`mb-1 text-[9px] ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.end}</p>
                            <input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) => updateShift(dayIdx, "endTime", e.target.value)}
                              className={`w-full rounded-lg border px-2 py-1.5 text-[11px] focus:border-violet-500/50 focus:outline-none ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white" : "border-purple-200 bg-white text-gray-900"}`}
                            />
                          </div>
                          <div className={`space-y-2 rounded-lg border p-2 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-purple-100 bg-purple-50/30"}`}>
                            <p className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? "text-white/25" : "text-gray-400"}`}>
                              {t.breakLabel}
                            </p>
                            <div>
                              <p className={`mb-1 text-[9px] ${isDark ? "text-white/20" : "text-gray-400"}`}>{t.breakStart}</p>
                              <input
                                type="time"
                                value={shift.breakStartTime || ""}
                                onChange={(e) => updateShift(dayIdx, "breakStartTime", e.target.value || null)}
                                className={`w-full rounded-lg border px-2 py-1 text-[11px] focus:border-violet-500/50 focus:outline-none ${isDark ? "border-white/[0.06] bg-white/[0.04] text-white/70" : "border-purple-200 bg-white text-gray-700"}`}
                              />
                            </div>
                            <div>
                              <p className={`mb-1 text-[9px] ${isDark ? "text-white/20" : "text-gray-400"}`}>{t.breakEnd}</p>
                              <input
                                type="time"
                                value={shift.breakEndTime || ""}
                                onChange={(e) => updateShift(dayIdx, "breakEndTime", e.target.value || null)}
                                className={`w-full rounded-lg border px-2 py-1 text-[11px] focus:border-violet-500/50 focus:outline-none ${isDark ? "border-white/[0.06] bg-white/[0.04] text-white/70" : "border-purple-200 bg-white text-gray-700"}`}
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
          </div>,
          document.body
        );
      })()}
    </div>
  );
}

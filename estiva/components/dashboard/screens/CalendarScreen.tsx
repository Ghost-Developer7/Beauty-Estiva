"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { appointmentService } from "@/services/appointmentService";
import type { AppointmentListItem } from "@/types/api";
import toast from "react-hot-toast";

const copy = {
  en: {
    today: "Today",
    newBooking: "New appointment",
    loading: "Loading...",
    noAppointments: "No appointments for this day.",
    time: "Time",
  },
  tr: {
    today: "Bugün",
    newBooking: "Yeni randevu",
    loading: "Yükleniyor...",
    noAppointments: "Bu gün için randevu yok.",
    time: "Saat",
  },
};

const HOURS = Array.from({ length: 28 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

function formatDateDisplay(date: Date, lang: "en" | "tr"): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", opts);
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive unique staff from appointments
  const staffList = Array.from(
    new Map(
      appointments.map((a) => [
        a.staffFullName,
        { name: a.staffFullName, id: a.staffId },
      ]),
    ).values(),
  );

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = toDateStr(currentDate);
      const res = await appointmentService.list({
        startDate: dateStr,
        endDate: dateStr,
      });
      if (res.data.success && res.data.data) {
        setAppointments(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Randevular yüklenemedi" : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [currentDate, language]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const prevDay = () =>
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 1);
      return n;
    });

  const nextDay = () =>
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 1);
      return n;
    });

  const goToday = () => setCurrentDate(new Date());

  // Map appointments to time slots per staff
  const getAppointmentAt = (staffName: string, slotTime: string) => {
    return appointments.find((a) => {
      if (a.staffFullName !== staffName) return false;
      const startHour = new Date(a.startTime).getHours();
      const startMin = new Date(a.startTime).getMinutes();
      const slot = `${startHour.toString().padStart(2, "0")}:${startMin < 30 ? "00" : "30"}`;
      return slot === slotTime;
    });
  };

  const getAppointmentSpan = (apt: AppointmentListItem) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const diffMin = (end.getTime() - start.getTime()) / 60000;
    return Math.max(1, Math.ceil(diffMin / 30));
  };

  // Track which slots are covered by a multi-slot appointment
  const coveredSlots = new Set<string>();
  appointments.forEach((apt) => {
    const staffName = apt.staffFullName;
    const start = new Date(apt.startTime);
    const span = getAppointmentSpan(apt);
    for (let i = 1; i < span; i++) {
      const slotDate = new Date(start.getTime() + i * 30 * 60000);
      const slotKey = `${staffName}-${slotDate.getHours().toString().padStart(2, "0")}:${slotDate.getMinutes() < 30 ? "00" : "30"}`;
      coveredSlots.add(slotKey);
    }
  });

  const STAFF_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div className={`flex flex-col gap-4 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* Header Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-2`}>
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            {"<"}
          </button>
          <div className={`flex h-8 min-w-0 sm:min-w-[200px] items-center justify-center rounded border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-2 sm:px-3 text-xs sm:text-sm font-medium truncate`}>
            {formatDateDisplay(currentDate, language)}
          </div>
          <button
            onClick={nextDay}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            {">"}
          </button>
          <button
            onClick={goToday}
            className={`h-8 shrink-0 rounded border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 sm:px-4 text-xs sm:text-sm font-medium ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            {text.today}
          </button>
        </div>
        <button
          onClick={() => (window.location.href = "/dashboard/appointments")}
          className={`h-8 rounded bg-[#2ecc71] px-3 sm:px-4 text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} hover:bg-[#27ae60]`}
        >
          + {text.newBooking}
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>
          {text.loading}
        </div>
      ) : staffList.length === 0 ? (
        <div className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>
          {text.noAppointments}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#0b0614]" : "bg-gray-50"}`}>
          {/* Staff Headers */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `60px repeat(${staffList.length}, 1fr)`,
            }}
          >
            <div className={`border-b border-r ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-2 text-center text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {text.time}
            </div>
            {staffList.map((staff, i) => (
              <div
                key={staff.name}
                className={`flex h-10 items-center justify-center text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                style={{ backgroundColor: STAFF_COLORS[i % STAFF_COLORS.length] }}
              >
                {staff.name}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `60px repeat(${staffList.length}, 1fr)`,
            }}
          >
            {/* Time column */}
            <div className={`border-r ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {HOURS.map((time) => (
                <div
                  key={time}
                  className={`flex h-12 items-center justify-center border-b ${isDark ? "border-white/5" : "border-gray-100"}`}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Staff columns */}
            {staffList.map((staff, staffIdx) => (
              <div
                key={staff.name}
                className={`relative border-r ${isDark ? "border-white/10" : "border-gray-200"}`}
              >
                {HOURS.map((time) => {
                  const slotKey = `${staff.name}-${time}`;
                  if (coveredSlots.has(slotKey)) {
                    return null; // hidden — covered by a spanning block
                  }
                  const apt = getAppointmentAt(staff.name, time);
                  if (apt) {
                    const span = getAppointmentSpan(apt);
                    const color = STAFF_COLORS[staffIdx % STAFF_COLORS.length];
                    return (
                      <div
                        key={time}
                        className={`border-b ${isDark ? "border-white/5" : "border-gray-100"} p-1`}
                        style={{ height: `${span * 48}px` }}
                      >
                        <div
                          className={`h-full rounded-lg px-2 py-1 text-xs ${isDark ? "text-white" : "text-gray-900"}`}
                          style={{ backgroundColor: color + "30", borderLeft: `3px solid ${color}` }}
                        >
                          <p className="font-semibold truncate">
                            {apt.customerFullName}
                          </p>
                          <p className={`${isDark ? "text-white/60" : "text-gray-600"} truncate`}>{apt.treatmentName}</p>
                          <p className={`${isDark ? "text-white/40" : "text-gray-400"}`}>
                            {new Date(apt.startTime).toLocaleTimeString(language === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(apt.endTime).toLocaleTimeString(language === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={time}
                      className={`h-12 border-b border-dashed ${isDark ? "border-white/5" : "border-gray-100"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

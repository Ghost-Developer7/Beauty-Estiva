"use client";

import { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
   PUBLIC TYPES
───────────────────────────────────────────────────────────── */

export interface CalendarEvent {
  id: string | number;
  startDate: string;   // "YYYY-MM-DD"
  endDate?: string;    // "YYYY-MM-DD" inclusive; defaults to startDate
  className?: string;  // Tailwind classes for the badge (bg + text + border)
  label: string;       // Primary text
  sublabel?: string;   // Secondary text (shown below label)
  meta?: unknown;      // Any extra data for custom renderers
}

export interface MonthCalendarProps {
  year: number;
  month: number; // 0-11

  events: CalendarEvent[];

  /** 7 short day-name strings, Mon → Sun order. Defaults to EN abbreviations. */
  dayLabels?: [string, string, string, string, string, string, string];

  /** Called when the user clicks a day cell. Receives "YYYY-MM-DD". */
  onDayClick?: (date: string) => void;

  /**
   * Override the default badge renderer.
   * `isStart` = this cell is the event's start date.
   * `isEnd`   = this cell is the event's end date.
   */
  renderEvent?: (
    event: CalendarEvent,
    ctx: { isStart: boolean; isEnd: boolean; date: string },
  ) => ReactNode;

  /** Minimum height of each day cell in px. Default 90. */
  minCellHeight?: number;

  /** Dim past days. Default true. */
  showPastOpacity?: boolean;

  /** Extra class on the outer wrapper. */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const DEFAULT_DAY_LABELS: MonthCalendarProps["dayLabels"] = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];

// Column index (0=Mon) → JS getDay() value
const COL_TO_JS_DAY = [1, 2, 3, 4, 5, 6, 0];

function buildGrid(year: number, month: number): (number | null)[][] {
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const grid: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) grid.push(cells.slice(i, i + 7));
  return grid;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function inRange(dateStr: string, event: CalendarEvent): boolean {
  const end = event.endDate ?? event.startDate;
  return dateStr >= event.startDate && dateStr <= end;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export default function MonthCalendar({
  year,
  month,
  events,
  dayLabels = DEFAULT_DAY_LABELS,
  onDayClick,
  renderEvent,
  minCellHeight = 90,
  showPastOpacity = true,
  className = "",
}: MonthCalendarProps) {
  const grid = buildGrid(year, month);
  const today = todayStr();

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      {/* ── Day-of-week header ── */}
      <div className="grid grid-cols-7 divide-x divide-white/[0.04] border-b border-white/[0.06] bg-white/[0.03]">
        {(dayLabels ?? DEFAULT_DAY_LABELS)!.map((label, colIdx) => {
          const jsDay = COL_TO_JS_DAY[colIdx];
          const isWeekend = jsDay === 0 || jsDay === 6;
          return (
            <div
              key={colIdx}
              className={`py-2.5 text-center text-[11px] font-bold tracking-widest uppercase ${
                isWeekend ? "text-amber-400/55" : "text-white/30"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* ── Calendar rows ── */}
      {grid.map((week, wIdx) => (
        <div
          key={wIdx}
          className="grid grid-cols-7 divide-x divide-white/[0.04] border-b border-white/[0.04] last:border-b-0"
        >
          {week.map((day, colIdx) => {
            const jsDay = COL_TO_JS_DAY[colIdx];
            const isWeekend = jsDay === 0 || jsDay === 6;
            const dateStr = day !== null ? toDateStr(year, month, day) : "";
            const isToday = dateStr === today;
            const isPast = showPastOpacity && day !== null && dateStr < today;

            const dayEvents = day !== null
              ? events.filter((e) => inRange(dateStr, e))
              : [];

            return (
              <div
                key={colIdx}
                style={{ minHeight: `${minCellHeight}px` }}
                onClick={() => day !== null && onDayClick?.(dateStr)}
                className={[
                  "p-2 transition",
                  isWeekend ? "bg-white/[0.012]" : "",
                  isPast ? "opacity-55" : "",
                  day !== null && onDayClick
                    ? "cursor-pointer hover:bg-white/[0.03]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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

                {/* Events */}
                {dayEvents.length > 0 && (
                  <div className="space-y-0.5">
                    {dayEvents.map((event) => {
                      const isStart = dateStr === event.startDate;
                      const isEnd = dateStr === (event.endDate ?? event.startDate);

                      if (renderEvent) {
                        return (
                          <div key={event.id}>
                            {renderEvent(event, { isStart, isEnd, date: dateStr })}
                          </div>
                        );
                      }

                      // ── Default badge ──
                      return (
                        <div
                          key={event.id}
                          title={`${event.label}${event.sublabel ? ` — ${event.sublabel}` : ""}`}
                          className={`w-full overflow-hidden rounded px-1.5 py-0.5 text-[9px] font-medium leading-snug ${
                            event.className ??
                            "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                          } ${!isStart ? "opacity-60" : ""}`}
                        >
                          <div className="truncate font-semibold">{event.label}</div>
                          {isStart && event.sublabel && (
                            <div className="truncate opacity-60">{event.sublabel}</div>
                          )}
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
  );
}

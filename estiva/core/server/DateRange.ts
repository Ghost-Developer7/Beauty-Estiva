/**
 * @module DateRange
 * Reusable date-range helpers for Prisma WHERE clause filters.
 *
 * Usage:
 *   const range = DateRange.fromQuery(searchParams);
 *   if (range) {
 *     where.AppointmentDate = { gte: range.start, lte: range.end };
 *   }
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Range {
  /** Start of the range — midnight UTC of the given date. */
  start: Date;
  /** End of the range — last millisecond of the given date. */
  end: Date;
}

// ─── DateRange class ──────────────────────────────────────────────────────────

export class DateRange {
  /**
   * Parse a date range from URLSearchParams.
   * Accepts `startDate` + `endDate` (YYYY-MM-DD) or `date` (single day).
   * Returns null if no recognised params are present.
   */
  static fromQuery(searchParams: URLSearchParams): Range | null {
    const startParam = searchParams.get("startDate") ?? searchParams.get("date");
    const endParam = searchParams.get("endDate") ?? searchParams.get("date");

    if (!startParam) return null;

    return {
      start: DateRange._startOf(startParam),
      end: DateRange._endOf(endParam ?? startParam),
    };
  }

  /**
   * Parse a range scoped to a specific month.
   * Reads `month` (1-12) and `year` (YYYY) from searchParams.
   * Falls back to `year` only (full year) if month is absent.
   * Returns null if neither is provided.
   */
  static fromMonthQuery(searchParams: URLSearchParams): Range | null {
    const yearStr = searchParams.get("year");
    if (!yearStr) return null;

    const year = parseInt(yearStr, 10);
    const monthStr = searchParams.get("month");

    if (monthStr) {
      const month = parseInt(monthStr, 10); // 1-based
      return DateRange.forMonth(year, month);
    }

    // Full year
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }

  /** Range covering exactly one calendar month (1-based month). */
  static forMonth(year: number, month: number): Range {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59, 999), // day 0 of next month = last day of this month
    };
  }

  /** Range covering today (local midnight → 23:59:59.999). */
  static today(): Range {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  /** Number of calendar days between two dates (inclusive of both endpoints). */
  static daysBetween(start: Date | string, end: Date | string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static _startOf(dateStr: string): Date {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private static _endOf(dateStr: string): Date {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}

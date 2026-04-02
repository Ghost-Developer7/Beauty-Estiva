/**
 * @module Format
 * Stateless formatting utilities for display values throughout the UI.
 *
 * All methods are pure functions — no side-effects, no state.
 * Locale defaults to Turkish (tr-TR) to match the primary market.
 *
 * Usage:
 *   Format.date("2024-06-15")           // → "15 Haz 2024"
 *   Format.currency(1500, "TRY")        // → "₺1.500,00"
 *   Format.duration(90, "tr")           // → "1 saat 30 dk"
 *   Format.initials("Ahmet Yıldız")     // → "AY"
 */

// ─── Format class ─────────────────────────────────────────────────────────────

export class Format {
  // ── Date & time ──────────────────────────────────────────────────────────────

  /**
   * Short date — "15 Haz 2024" (tr) / "Jun 15, 2024" (en).
   */
  static date(
    value: string | Date | null | undefined,
    locale: "tr" | "en" = "tr",
  ): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(
      locale === "tr" ? "tr-TR" : "en-US",
      { day: "2-digit", month: "short", year: "numeric" },
    );
  }

  /**
   * Full date + time — "15 Haz 2024, 14:30" (tr).
   */
  static dateTime(
    value: string | Date | null | undefined,
    locale: "tr" | "en" = "tr",
  ): string {
    if (!value) return "—";
    return new Date(value).toLocaleString(
      locale === "tr" ? "tr-TR" : "en-US",
      { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
    );
  }

  /**
   * Time only — "14:30".
   */
  static time(
    value: string | Date | null | undefined,
    locale: "tr" | "en" = "tr",
  ): string {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString(
      locale === "tr" ? "tr-TR" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );
  }

  // ── Numbers & currency ───────────────────────────────────────────────────────

  /**
   * Currency — "₺1.500,00" / "$1,500.00".
   */
  static currency(
    amount: number | null | undefined,
    currencyCode = "TRY",
    locale: "tr" | "en" = "tr",
  ): string {
    if (amount == null) return "—";
    return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Plain number with thousands separator — "1.500" (tr) / "1,500" (en).
   */
  static number(
    value: number | null | undefined,
    decimals = 0,
    locale: "tr" | "en" = "tr",
  ): string {
    if (value == null) return "—";
    return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Percentage — "75%" / "75,00%".
   */
  static percent(
    value: number | null | undefined,
    decimals = 0,
    locale: "tr" | "en" = "tr",
  ): string {
    if (value == null) return "—";
    return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  // ── Duration ─────────────────────────────────────────────────────────────────

  /**
   * Minutes → human-readable string — "1 saat 30 dk" (tr) / "1 hr 30 min" (en).
   */
  static duration(minutes: number, locale: "tr" | "en" = "tr"): string {
    if (!minutes || minutes <= 0) return locale === "tr" ? "0 dk" : "0 min";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (locale === "tr") {
      if (h === 0) return `${m} dk`;
      if (m === 0) return `${h} saat`;
      return `${h} saat ${m} dk`;
    } else {
      if (h === 0) return `${m} min`;
      if (m === 0) return `${h} hr`;
      return `${h} hr ${m} min`;
    }
  }

  // ── Text helpers ─────────────────────────────────────────────────────────────

  /**
   * Extract up to 2 uppercase initials from a full name.
   * "Ahmet Yıldız" → "AY", "Ahmet" → "A".
   */
  static initials(fullName: string | null | undefined): string {
    if (!fullName) return "?";
    return fullName
      .trim()
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Truncate a string to a max length, appending "…" if truncated.
   */
  static truncate(text: string | null | undefined, maxLength: number): string {
    if (!text) return "";
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;
  }

  /**
   * Mask a phone number — "+90 532 *** ** 89".
   */
  static maskPhone(phone: string | null | undefined): string {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 4
      ? `${digits.slice(0, -4).replace(/\d/g, "*")}${digits.slice(-4)}`
      : phone;
  }
}

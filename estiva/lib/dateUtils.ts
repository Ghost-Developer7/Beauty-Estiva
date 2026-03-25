export function formatDate(dateStr: string | null | undefined, language: "en" | "tr"): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return language === "tr"
    ? d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr: string | null | undefined, language: "en" | "tr"): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const locale = language === "tr" ? "tr-TR" : "en-US";
  return `${d.toLocaleDateString(locale)} ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
}

/* ═══════════════════════════════════════════
   Export Utilities — Excel & PDF
   Full Turkish Unicode support via embedded font
   ═══════════════════════════════════════════ */

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: "currency" | "date" | "datetime" | "percent" | "number";
}

/* ─── Formatters ─── */

const fmtCurrency = (n: number): string =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

const fmtDate = (d: string | null | undefined): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDateTime = (d: string | null | undefined): string => {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })} ${date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
};

const fmtPercent = (n: number): string => `%${n.toLocaleString("tr-TR")}`;

function formatCellValue(value: unknown, format?: ExportColumn["format"]): string | number {
  if (value === null || value === undefined) return "—";
  switch (format) {
    case "currency": return fmtCurrency(Number(value));
    case "date": return fmtDate(String(value));
    case "datetime": return fmtDateTime(String(value));
    case "percent": return fmtPercent(Number(value));
    case "number": return Number(value).toLocaleString("tr-TR");
    default: return String(value);
  }
}

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce((acc: unknown, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

/* ═══════════════════════════════════════════
   FONT LOADING — Roboto with full Turkish support
   ═══════════════════════════════════════════ */

// CDN URLs for Roboto (fontsource via jsDelivr — stable, versioned)
const FONT_URLS = {
  regular: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext-400-normal.woff",
  bold: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext-700-normal.woff",
};

// In-memory font cache so we only fetch once per session
let fontCache: { regular?: string; bold?: string } = {};

async function fetchFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function loadFonts(): Promise<{ regular: string; bold: string }> {
  if (fontCache.regular && fontCache.bold) {
    return fontCache as { regular: string; bold: string };
  }

  const [regular, bold] = await Promise.all([
    fetchFontAsBase64(FONT_URLS.regular),
    fetchFontAsBase64(FONT_URLS.bold),
  ]);

  fontCache = { regular, bold };
  return { regular, bold };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerFonts(doc: any, fonts: { regular: string; bold: string }) {
  doc.addFileToVFS("Roboto-Regular.woff", fonts.regular);
  doc.addFont("Roboto-Regular.woff", "Roboto", "normal");

  doc.addFileToVFS("Roboto-Bold.woff", fonts.bold);
  doc.addFont("Roboto-Bold.woff", "Roboto", "bold");
}

/* ═══════════════════════════════════════════
   EXCEL EXPORT
   ═══════════════════════════════════════════ */

export async function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): Promise<void> {
  const xlsxModule = await import("xlsx");
  const XLSX = xlsxModule.default ?? xlsxModule;

  const now = new Date();
  const dateStr = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

  // Title + date + empty + headers + data + empty + summary
  const titleRow = [filename];
  const dateRow = [dateStr];
  const emptyRow: string[] = [];
  const headers = columns.map((c) => c.header);

  const rows = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      return formatCellValue(raw, col.format);
    }),
  );

  const summaryRow = [`Toplam: ${data.length} kayıt`];

  const ws = XLSX.utils.aoa_to_sheet([
    titleRow, dateRow, emptyRow,
    headers,
    ...rows,
    emptyRow, summaryRow,
  ]);

  // Column widths
  ws["!cols"] = columns.map((col, i) => {
    const maxLen = Math.max(col.header.length, ...rows.map((r) => String(r[i] ?? "").length));
    return { wch: Math.min(maxLen + 4, 50) };
  });

  // Merge title/date rows
  if (columns.length > 1) {
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    ];
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ═══════════════════════════════════════════
   PDF EXPORT — Professional Template + Turkish Unicode
   ═══════════════════════════════════════════ */

export async function exportToPDF(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  title: string,
  filename: string,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Load & register Turkish-supporting font
  let fontFamily = "helvetica"; // fallback
  try {
    const fonts = await loadFonts();
    registerFonts(doc, fonts);
    fontFamily = "Roboto";
  } catch {
    // Font fetch failed — continue with helvetica (no Turkish chars)
  }

  const now = new Date();
  const exportDate = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

  // ─── HEADER BAND ───
  // Dark gradient header
  doc.setFillColor(24, 14, 50);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Purple accent line
  const gradientSteps = 60;
  for (let i = 0; i < gradientSteps; i++) {
    const ratio = i / gradientSteps;
    const r = Math.round(168 + (236 - 168) * ratio);
    const g = Math.round(85 + (72 - 85) * ratio);
    const b = Math.round(247 + (153 - 247) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect((pageWidth / gradientSteps) * i, 30, pageWidth / gradientSteps + 0.5, 1.2, "F");
  }

  // Brand name
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Beauty-Estiva", 14, 14);

  // Document title
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 180, 255);
  doc.text(title, 14, 23);

  // Date badge - right side
  doc.setFillColor(255, 255, 255, 15);
  doc.roundedRect(pageWidth - 60, 6, 46, 18, 3, 3, "F");

  doc.setFont(fontFamily, "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 190, 230);
  doc.text(exportDate, pageWidth - 37, 13, { align: "center" });

  doc.setFont(fontFamily, "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${data.length}`, pageWidth - 43, 21);

  doc.setFont(fontFamily, "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 190, 230);
  doc.text("kayıt", pageWidth - 35, 21);

  // ─── TABLE ───
  const head = [columns.map((c) => c.header)];

  const body = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      return String(formatCellValue(raw, col.format));
    }),
  );

  const columnStyles: Record<number, { cellWidth?: number; halign?: "left" | "center" | "right" }> = {};
  columns.forEach((col, i) => {
    if (col.width) columnStyles[i] = { cellWidth: col.width };
    if (col.format === "currency" || col.format === "number" || col.format === "percent") {
      columnStyles[i] = { ...columnStyles[i], halign: "right" };
    }
  });

  autoTable(doc, {
    startY: 36,
    head,
    body,
    columnStyles,
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: [225, 220, 240],
      lineWidth: 0.15,
      textColor: [35, 30, 55],
      overflow: "linebreak",
      font: fontFamily,
    },
    headStyles: {
      fillColor: [40, 25, 75],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 245, 255],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: 14, right: 14, bottom: 22 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: (hookData: any) => {
      // ─── FOOTER ───
      // Footer line
      doc.setDrawColor(180, 170, 210);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

      doc.setFont(fontFamily, "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 130, 170);
      doc.text(`Beauty-Estiva  ·  ${exportDate}`, 14, pageHeight - 10);

      doc.text(
        `Sayfa ${hookData.pageNumber}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: "right" },
      );

      // Re-draw header on subsequent pages
      if (hookData.pageNumber > 1) {
        doc.setFillColor(24, 14, 50);
        doc.rect(0, 0, pageWidth, 10, "F");
        doc.setFont(fontFamily, "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("Beauty-Estiva", 14, 7);
        doc.setFont(fontFamily, "normal");
        doc.setFontSize(8);
        doc.setTextColor(200, 180, 255);
        doc.text(title, pageWidth - 14, 7, { align: "right" });
      }
    },
  });

  doc.save(`${filename}.pdf`);
}

/* ═══════════════════════════════════════════
   Export Utilities — Excel & PDF
   ═══════════════════════════════════════════ */

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: "currency" | "date" | "datetime" | "percent" | "number";
}

/* ─── Currency formatter ─── */
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
    case "currency":
      return fmtCurrency(Number(value));
    case "date":
      return fmtDate(String(value));
    case "datetime":
      return fmtDateTime(String(value));
    case "percent":
      return fmtPercent(Number(value));
    case "number":
      return Number(value).toLocaleString("tr-TR");
    default:
      return String(value);
  }
}

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce((acc: unknown, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

/* ═══════════════════════════════════════════
   EXCEL EXPORT — Styled
   ═══════════════════════════════════════════ */

export async function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): Promise<void> {
  const xlsxModule = await import("xlsx");
  const XLSX = xlsxModule.default ?? xlsxModule;

  // Title row
  const titleRow = [filename];
  const dateRow = [new Date().toLocaleDateString("tr-TR") + " " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })];
  const emptyRow: string[] = [];

  // Headers
  const headers = columns.map((c) => c.header);

  // Data rows
  const rows = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      return formatCellValue(raw, col.format);
    }),
  );

  // Summary row
  const summaryRow = [`${data.length} kayıt`];

  const ws = XLSX.utils.aoa_to_sheet([
    titleRow,
    dateRow,
    emptyRow,
    headers,
    ...rows,
    emptyRow,
    summaryRow,
  ]);

  // Column widths
  const colWidths = columns.map((col, i) => {
    const maxLen = Math.max(
      col.header.length,
      ...rows.map((r) => String(r[i] ?? "").length),
    );
    return { wch: Math.min(maxLen + 4, 50) };
  });
  ws["!cols"] = colWidths;

  // Merge title row across all columns
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
   PDF EXPORT — Turkish Unicode + Professional Template
   ═══════════════════════════════════════════ */

/**
 * Replace Turkish special characters with ASCII equivalents
 * for jsPDF compatibility (default fonts don't support Unicode)
 */
function turkishToAscii(text: string): string {
  const map: Record<string, string> = {
    "ş": "s", "Ş": "S",
    "ç": "c", "Ç": "C",
    "ğ": "g", "Ğ": "G",
    "ü": "u", "Ü": "U",
    "ö": "o", "Ö": "O",
    "ı": "i", "İ": "I",
  };
  return text.replace(/[şŞçÇğĞüÜöÖıİ]/g, (ch) => map[ch] || ch);
}

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

  const now = new Date();
  const exportDate = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

  // ─── Header band ───
  doc.setFillColor(24, 14, 50);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent line
  doc.setFillColor(168, 85, 247);
  doc.rect(0, 28, pageWidth, 1, "F");

  // Brand name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(turkishToAscii("Beauty-Estiva"), 14, 13);

  // Document title
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 180, 255);
  doc.text(turkishToAscii(title), 14, 21);

  // Date - right aligned
  doc.setFontSize(9);
  doc.setTextColor(180, 170, 210);
  doc.text(exportDate, pageWidth - 14, 13, { align: "right" });

  // Record count
  doc.setFontSize(8);
  doc.setTextColor(160, 150, 200);
  doc.text(`${data.length} ${turkishToAscii("kayit")}`, pageWidth - 14, 21, { align: "right" });

  // ─── Table ───
  const head = [columns.map((c) => turkishToAscii(c.header))];

  const body = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      const formatted = String(formatCellValue(raw, col.format));
      return turkishToAscii(formatted);
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
    startY: 34,
    head,
    body,
    columnStyles,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [230, 230, 240],
      lineWidth: 0.1,
      textColor: [40, 40, 60],
      overflow: "linebreak",
      font: "helvetica",
    },
    headStyles: {
      fillColor: [40, 25, 75],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 246, 255],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: 14, right: 14, bottom: 20 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: (hookData: any) => {
      // Footer line
      doc.setDrawColor(200, 190, 230);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      // Footer text
      doc.setFontSize(7);
      doc.setTextColor(140, 130, 170);
      doc.text(
        `Beauty-Estiva  |  ${exportDate}`,
        14,
        pageHeight - 8,
      );
      doc.text(
        `${turkishToAscii("Sayfa")} ${hookData.pageNumber}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: "right" },
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

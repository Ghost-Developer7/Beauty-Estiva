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
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";

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
   EXCEL EXPORT
   ═══════════════════════════════════════════ */

export async function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): Promise<void> {
  const xlsxModule = await import("xlsx");
  const XLSX = xlsxModule.default ?? xlsxModule;

  // Build header row
  const headers = columns.map((c) => c.header);

  // Build data rows
  const rows = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      return formatCellValue(raw, col.format);
    }),
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-width columns
  const colWidths = columns.map((col, i) => {
    const maxLen = Math.max(
      col.header.length,
      ...rows.map((r) => String(r[i] ?? "").length),
    );
    return { wch: Math.min(maxLen + 4, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ═══════════════════════════════════════════
   PDF EXPORT
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

  // Header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Beauty-Estiva", 14, 15);

  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(title, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  const now = new Date();
  const exportDate = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
  doc.text(exportDate, doc.internal.pageSize.width - 14, 15, { align: "right" });

  // Table headers
  const head = [columns.map((c) => c.header)];

  // Table body
  const body = data.map((item) =>
    columns.map((col) => {
      const raw = getNestedValue(item, col.key);
      return String(formatCellValue(raw, col.format));
    }),
  );

  // Column styles
  const columnStyles: Record<number, { cellWidth?: number; halign?: "left" | "center" | "right" }> = {};
  columns.forEach((col, i) => {
    if (col.width) columnStyles[i] = { cellWidth: col.width };
    if (col.format === "currency" || col.format === "number" || col.format === "percent") {
      columnStyles[i] = { ...columnStyles[i], halign: "right" };
    }
  });

  autoTable(doc, {
    startY: 28,
    head,
    body,
    columnStyles,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      textColor: [50, 50, 50],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 30, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 252],
    },
    margin: { left: 14, right: 14 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: (hookData: any) => {
      // Footer with page number
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Beauty-Estiva | ${exportDate}`,
        14,
        pageHeight - 8,
      );
      doc.text(
        `${hookData.pageNumber}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: "right" },
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

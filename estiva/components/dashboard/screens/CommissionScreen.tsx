"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { commissionService } from "@/services/commissionService";
import { staffService } from "@/services/staffService";
import type {
  StaffCommissionSummary,
  StaffCommissionRecord,
  AllCommissionRates,
  StaffMember,
} from "@/types/api";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ────────────────────────────── i18n copy ────────────────────────────── */

const copy = {
  en: {
    title: "Commission Management",
    tabs: ["Summary", "Commission Rates", "Detailed Records"],
    // Month/year
    month: "Month",
    year: "Year",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    // Summary tab
    totalEarnedThisMonth: "Total Earned",
    totalPaid: "Total Paid",
    remainingToPay: "Remaining",
    staff: "Staff",
    servicesPerformed: "Services",
    revenueGenerated: "Revenue",
    avgRate: "Avg Rate",
    commissionEarned: "Earned",
    paidAmount: "Paid",
    remaining: "Remaining",
    payBtn: "Pay",
    payAll: "Pay All",
    // Rates tab
    defaultRate: "Default (%)",
    quickSet: "Quick Set All",
    quickSetPlaceholder: "Rate %",
    applyAll: "Apply",
    save: "Save",
    saving: "Saving...",
    saved: "Commission rates saved.",
    noTreatments: "No treatments found.",
    // Records tab
    date: "Date",
    treatment: "Treatment",
    customer: "Customer",
    servicePrice: "Service Price",
    ratePercent: "Rate %",
    commissionAmount: "Commission",
    status: "Status",
    action: "Action",
    paidLabel: "Paid",
    unpaidLabel: "Unpaid",
    markPaid: "Mark Paid",
    bulkPay: "Pay Selected",
    selectAll: "Select All",
    filterByStaff: "All Staff",
    filterByStatus: "All Status",
    paidFilter: "Paid",
    unpaidFilter: "Unpaid",
    // Modal
    confirmPayTitle: "Confirm Payment",
    confirmPayMsg: "Mark selected commissions as paid?",
    confirmBulkPayMsg: "Pay all unpaid commissions for this staff member this month?",
    confirm: "Confirm",
    cancel: "Cancel",
    // General
    loading: "Loading...",
    noData: "No data found.",
    currency: "TRY",
  },
  tr: {
    title: "Komisyon Yönetimi",
    tabs: ["Özet", "Komisyon Oranları", "Detaylı Kayıtlar"],
    month: "Ay",
    year: "Yıl",
    months: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
    totalEarnedThisMonth: "Toplam Kazanılan",
    totalPaid: "Toplam Ödenen",
    remainingToPay: "Kalan",
    staff: "Personel",
    servicesPerformed: "Hizmet",
    revenueGenerated: "Gelir",
    avgRate: "Ort. Oran",
    commissionEarned: "Kazanılan",
    paidAmount: "Ödenen",
    remaining: "Kalan",
    payBtn: "Öde",
    payAll: "Tümünü Öde",
    defaultRate: "Varsayılan (%)",
    quickSet: "Toplu Ayarla",
    quickSetPlaceholder: "Oran %",
    applyAll: "Uygula",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Komisyon oranları kaydedildi.",
    noTreatments: "Hizmet bulunamadı.",
    date: "Tarih",
    treatment: "Hizmet",
    customer: "Müşteri",
    servicePrice: "Hizmet Fiyatı",
    ratePercent: "Oran %",
    commissionAmount: "Komisyon",
    status: "Durum",
    action: "İşlem",
    paidLabel: "Ödendi",
    unpaidLabel: "Ödenmedi",
    markPaid: "Ödendi İşaretle",
    bulkPay: "Seçilenleri Öde",
    selectAll: "Tümünü Seç",
    filterByStaff: "Tüm Personel",
    filterByStatus: "Tüm Durum",
    paidFilter: "Ödenmiş",
    unpaidFilter: "Ödenmemiş",
    confirmPayTitle: "Ödeme Onayı",
    confirmPayMsg: "Seçili komisyonları ödendi olarak işaretle?",
    confirmBulkPayMsg: "Bu personelin bu aydaki tüm ödenmemiş komisyonlarını öde?",
    confirm: "Onayla",
    cancel: "İptal",
    loading: "Yükleniyor...",
    noData: "Veri bulunamadı.",
    currency: "TRY",
  },
};

/* ────────────────────────────── Helpers ────────────────────────────── */

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

/* ────────────────────────────── Component ────────────────────────────── */

export default function CommissionScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];
  const now = new Date();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Summary
  const [summaries, setSummaries] = useState<StaffCommissionSummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Rates
  const [allRates, setAllRates] = useState<AllCommissionRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [editedRates, setEditedRates] = useState<
    Record<number, { defaultRate: number; treatments: Record<number, number> }>
  >({});
  const [quickSetValue, setQuickSetValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Records
  const [records, setRecords] = useState<StaffCommissionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [staffFilter, setStaffFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "unpaid">("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Modal
  const [modal, setModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  // ── Date helpers ──
  const startDate = useMemo(
    () => `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
    [selectedMonth, selectedYear],
  );
  const endDate = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth, 0);
    return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [selectedMonth, selectedYear]);

  // ── Fetchers ──
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await commissionService.getSummary({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.data.success && res.data.data) setSummaries(res.data.data);
      else setSummaries([]);
    } catch {
      toast.error(language === "tr" ? "Özet yüklenemedi" : "Failed to load summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedMonth, selectedYear, language]);

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        startDate,
        endDate,
      };
      if (staffFilter !== "") params.staffId = staffFilter;
      if (statusFilter === "paid") params.isPaid = true;
      if (statusFilter === "unpaid") params.isPaid = false;
      const res = await commissionService.getRecords(params as any);
      if (res.data.success && res.data.data) setRecords(res.data.data);
      else setRecords([]);
    } catch {
      toast.error(language === "tr" ? "Kayıtlar yüklenemedi" : "Failed to load records");
    } finally {
      setRecordsLoading(false);
    }
  }, [startDate, endDate, staffFilter, statusFilter, language]);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await commissionService.getAllRates();
      if (res.data.success && res.data.data) {
        setAllRates(res.data.data);
        // Initialize edited rates from fetched data
        const init: typeof editedRates = {};
        for (const sr of res.data.data.staffRates) {
          const trMap: Record<number, number> = {};
          for (const tc of sr.treatmentCommissions) {
            trMap[tc.treatmentId] = tc.commissionRate;
          }
          init[sr.staffId] = { defaultRate: sr.defaultCommissionRate, treatments: trMap };
        }
        setEditedRates(init);
      }
    } catch {
      toast.error(language === "tr" ? "Oranlar yüklenemedi" : "Failed to load rates");
    } finally {
      setRatesLoading(false);
    }
  }, [language]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await staffService.list();
      if (res.data.success && res.data.data) setStaffList(res.data.data as StaffMember[]);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (activeTab === 0) fetchSummary();
    if (activeTab === 2) fetchRecords();
  }, [activeTab, fetchSummary, fetchRecords]);

  useEffect(() => {
    if (activeTab === 1) fetchRates();
  }, [activeTab, fetchRates]);

  // ── Summary totals ──
  const totalEarned = summaries.reduce((a, s) => a + s.totalCommissionInTry, 0);
  const totalPaid = summaries.reduce((a, s) => a + s.paidCommissionInTry, 0);
  const totalRemaining = summaries.reduce((a, s) => a + s.unpaidCommissionInTry, 0);

  // ── Rates handlers ──
  const getEditedRate = (staffId: number, treatmentId: number) =>
    editedRates[staffId]?.treatments[treatmentId] ?? 0;

  const setTreatmentRate = (staffId: number, treatmentId: number, value: number) => {
    setEditedRates((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        treatments: { ...prev[staffId]?.treatments, [treatmentId]: value },
      },
    }));
  };

  const setDefaultRate = (staffId: number, value: number) => {
    setEditedRates((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], defaultRate: value },
    }));
  };

  const handleQuickSetAll = () => {
    const val = parseFloat(quickSetValue);
    if (isNaN(val) || val < 0 || val > 100) return;
    if (!allRates) return;
    const next = { ...editedRates };
    for (const sr of allRates.staffRates) {
      next[sr.staffId] = {
        defaultRate: val,
        treatments: {},
      };
      for (const tr of allRates.treatments) {
        next[sr.staffId].treatments[tr.id] = val;
      }
    }
    setEditedRates(next);
  };

  const handleSaveRates = async () => {
    if (!allRates) return;
    setSaving(true);
    try {
      for (const sr of allRates.staffRates) {
        const edited = editedRates[sr.staffId];
        if (!edited) continue;
        const treatmentRates = allRates.treatments
          .map((tr) => ({
            treatmentId: tr.id,
            commissionRate: edited.treatments[tr.id] ?? 0,
          }))
          .filter((r) => r.commissionRate > 0);

        await commissionService.setStaffRates(sr.staffId, {
          defaultCommissionRate: edited.defaultRate,
          treatmentRates: treatmentRates.length > 0 ? treatmentRates : undefined,
        });
      }
      toast.success(t.saved);
      fetchRates();
    } catch {
      toast.error(language === "tr" ? "Kayıt başarısız" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Records handlers ──
  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const unpaid = records.filter((r) => !r.isPaid);
    if (selectedIds.size === unpaid.length && unpaid.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(unpaid.map((r) => r.id)));
  };

  const handleBulkPay = () => {
    if (selectedIds.size === 0) return;
    setModal({
      show: true,
      message: t.confirmPayMsg,
      onConfirm: async () => {
        try {
          await commissionService.markPaid([...selectedIds]);
          toast.success(language === "tr" ? "Komisyonlar ödendi olarak işaretlendi" : "Commissions marked as paid");
          setSelectedIds(new Set());
          fetchRecords();
          fetchSummary();
        } catch {
          toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
        }
        setModal((p) => ({ ...p, show: false }));
      },
    });
  };

  const handlePaySingle = (id: number) => {
    setModal({
      show: true,
      message: t.confirmPayMsg,
      onConfirm: async () => {
        try {
          await commissionService.payRecord(id);
          toast.success(language === "tr" ? "Komisyon ödendi" : "Commission paid");
          fetchRecords();
          fetchSummary();
        } catch {
          toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
        }
        setModal((p) => ({ ...p, show: false }));
      },
    });
  };

  const handlePayAllForStaff = (staffId: number) => {
    setModal({
      show: true,
      message: t.confirmBulkPayMsg,
      onConfirm: async () => {
        try {
          await commissionService.bulkPay({
            staffId,
            month: selectedMonth,
            year: selectedYear,
          });
          toast.success(language === "tr" ? "Tüm komisyonlar ödendi" : "All commissions paid");
          fetchSummary();
          fetchRecords();
        } catch {
          toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
        }
        setModal((p) => ({ ...p, show: false }));
      },
    });
  };

  // Year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const inputClass =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none transition";

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <div className="flex items-center gap-3">
          {activeTab === 0 && (
            <ExportButtons
              data={summaries as unknown as Record<string, unknown>[]}
              columns={((): ExportColumn[] => {
                const isTr = language === "tr";
                return [
                  { header: isTr ? "Personel" : "Staff", key: "staffFullName" },
                  { header: isTr ? "Toplam Gelir" : "Total Revenue", key: "totalPaymentsInTry", format: "currency" },
                  { header: isTr ? "Komisyon" : "Commission", key: "totalCommissionInTry", format: "currency" },
                  { header: isTr ? "Salon Payı" : "Salon Share", key: "totalSalonShareInTry", format: "currency" },
                  { header: isTr ? "Ödenen" : "Paid", key: "paidCommissionInTry", format: "currency" },
                  { header: isTr ? "Ödenmemiş" : "Unpaid", key: "unpaidCommissionInTry", format: "currency" },
                  { header: isTr ? "Kayıt" : "Records", key: "recordCount", format: "number" },
                ];
              })()}
              filenamePrefix={language === "tr" ? "Komisyon_Özet" : "Commission_Summary"}
              pdfTitle={language === "tr" ? "Komisyon Özeti" : "Commission Summary"}
            />
          )}
          {activeTab === 2 && (
            <ExportButtons
              data={records as unknown as Record<string, unknown>[]}
              columns={((): ExportColumn[] => {
                const isTr = language === "tr";
                return [
                  { header: isTr ? "Personel" : "Staff", key: "staffFullName" },
                  { header: isTr ? "Hizmet" : "Treatment", key: "treatmentName" },
                  { header: isTr ? "Müşteri" : "Customer", key: "customerFullName" },
                  { header: isTr ? "Tarih" : "Date", key: "appointmentDate", format: "date" },
                  { header: isTr ? "Tutar" : "Amount", key: "paymentAmountInTry", format: "currency" },
                  { header: isTr ? "Oran" : "Rate", key: "commissionRate", format: "percent" },
                  { header: isTr ? "Komisyon" : "Commission", key: "commissionAmountInTry", format: "currency" },
                  { header: isTr ? "Durum" : "Status", key: "isPaid" },
                ];
              })()}
              filenamePrefix={language === "tr" ? "Komisyon_Kayıtları" : "Commission_Records"}
              pdfTitle={language === "tr" ? "Komisyon Kayıtları" : "Commission Records"}
            />
          )}
          <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className={inputClass}
          >
            {t.months.map((m, i) => (
              <option key={i} value={i + 1} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={inputClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>
                {y}
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2">
        {t.tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all duration-200 ${
              activeTab === i
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB 0: Summary ══════════════════ */}
      {activeTab === 0 && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label={t.totalEarnedThisMonth}
              value={fmt(totalEarned)}
              currency={t.currency}
              color="text-amber-400"
              bgGlow="from-amber-500/10" isDark={isDark} />
            <SummaryCard
              label={t.totalPaid}
              value={fmt(totalPaid)}
              currency={t.currency}
              color="text-green-400"
              bgGlow="from-green-500/10" isDark={isDark} />
            <SummaryCard
              label={t.remainingToPay}
              value={fmt(totalRemaining)}
              currency={t.currency}
              color="text-red-400"
              bgGlow="from-red-500/10" isDark={isDark} />
          </div>

          {/* Staff summary table */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} shadow-[0_15px_40px_rgba(3,2,9,0.5)]`}>
            {summaryLoading ? (
              <LoadingState text={t.loading} isDark={isDark} />
            ) : summaries.length === 0 ? (
              <EmptyState text={t.noData} isDark={isDark} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      <th className="px-4 py-3">{t.staff}</th>
                      <th className="px-4 py-3 text-center">{t.servicesPerformed}</th>
                      <th className="px-4 py-3 text-right">{t.revenueGenerated}</th>
                      <th className="px-4 py-3 text-right">{t.commissionEarned}</th>
                      <th className="px-4 py-3 text-right">{t.paidAmount}</th>
                      <th className="px-4 py-3 text-right">{t.remaining}</th>
                      <th className="px-4 py-3 text-center">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                    {summaries.map((s) => (
                      <tr key={s.staffId} className="transition hover:bg-white/[0.04]">
                        <td className="px-4 py-3 font-medium">{s.staffFullName}</td>
                        <td className={`px-4 py-3 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>{s.recordCount}</td>
                        <td className={`px-4 py-3 text-right ${isDark ? "text-white/60" : "text-gray-600"}`}>
                          {fmt(s.totalPaymentsInTry)} {t.currency}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-amber-400">
                          {fmt(s.totalCommissionInTry)} {t.currency}
                        </td>
                        <td className="px-4 py-3 text-right text-green-400">
                          {fmt(s.paidCommissionInTry)} {t.currency}
                        </td>
                        <td className="px-4 py-3 text-right text-red-400">
                          {fmt(s.unpaidCommissionInTry)} {t.currency}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.unpaidCommissionInTry > 0 && (
                            <button
                              onClick={() => handlePayAllForStaff(s.staffId)}
                              className={`rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-500/20 transition hover:shadow-green-500/30`}
                            >
                              {t.payBtn}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 1: Commission Rates ══════════════════ */}
      {activeTab === 1 && (
        <div className="space-y-4">
          {/* Quick set */}
          <div className={`flex flex-wrap items-center gap-3 rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4`}>
            <span className={`text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.quickSet}:</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={quickSetValue}
              onChange={(e) => setQuickSetValue(e.target.value)}
              placeholder={t.quickSetPlaceholder}
              className={`${inputClass} w-24`}
            />
            <button
              onClick={handleQuickSetAll}
              className={`rounded-lg bg-purple-600/80 px-4 py-2 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition hover:bg-purple-600`}
            >
              {t.applyAll}
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSaveRates}
              disabled={saving}
              className={`rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-500/20 transition hover:shadow-green-500/30 disabled:opacity-50`}
            >
              {saving ? t.saving : t.save}
            </button>
          </div>

          {/* Rate matrix */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} shadow-[0_15px_40px_rgba(3,2,9,0.5)]`}>
            {ratesLoading ? (
              <LoadingState text={t.loading} isDark={isDark} />
            ) : !allRates || allRates.staffRates.length === 0 ? (
              <EmptyState text={t.noData} isDark={isDark} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      <th className="sticky left-0 z-10 bg-[#0f0f1a] px-4 py-3">{t.staff}</th>
                      <th className="px-3 py-3 text-center">{t.defaultRate}</th>
                      {allRates.treatments.map((tr) => (
                        <th key={tr.id} className="px-3 py-3 text-center whitespace-nowrap">
                          {tr.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                    {allRates.staffRates.map((sr) => (
                      <tr key={sr.staffId} className="transition hover:bg-white/[0.04]">
                        <td className="sticky left-0 z-10 bg-[#0f0f1a] px-4 py-3 font-medium whitespace-nowrap">
                          {sr.staffFullName}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={editedRates[sr.staffId]?.defaultRate ?? 0}
                            onChange={(e) => setDefaultRate(sr.staffId, Number(e.target.value))}
                            className={`w-20 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-2 py-1.5 text-center text-xs ${isDark ? "text-white" : "text-gray-900"} focus:border-purple-500/50 focus:outline-none`}
                          />
                        </td>
                        {allRates.treatments.map((tr) => (
                          <td key={tr.id} className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={getEditedRate(sr.staffId, tr.id)}
                              onChange={(e) =>
                                setTreatmentRate(sr.staffId, tr.id, Number(e.target.value))
                              }
                              className={`w-20 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-2 py-1.5 text-center text-xs ${isDark ? "text-white" : "text-gray-900"} focus:border-purple-500/50 focus:outline-none`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 2: Detailed Records ══════════════════ */}
      {activeTab === 2 && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value ? Number(e.target.value) : "")}
              className={inputClass}
            >
              <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>
                {t.filterByStaff}
              </option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>
                  {s.name} {s.surname}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={inputClass}
            >
              <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.filterByStatus}</option>
              <option value="paid" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.paidFilter}</option>
              <option value="unpaid" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.unpaidFilter}</option>
            </select>

            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkPay}
                className={`rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-500/20 transition hover:shadow-green-500/30`}
              >
                {t.bulkPay} ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Records table */}
          <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} shadow-[0_15px_40px_rgba(3,2,9,0.5)]`}>
            {recordsLoading ? (
              <LoadingState text={t.loading} isDark={isDark} />
            ) : records.length === 0 ? (
              <EmptyState text={t.noData} isDark={isDark} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      <th className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === records.filter((r) => !r.isPaid).length &&
                            selectedIds.size > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded accent-purple-500"
                        />
                      </th>
                      <th className="px-3 py-3">{t.date}</th>
                      <th className="px-3 py-3">{t.staff}</th>
                      <th className="px-3 py-3">{t.treatment}</th>
                      <th className="px-3 py-3">{t.customer}</th>
                      <th className="px-3 py-3 text-right">{t.servicePrice}</th>
                      <th className="px-3 py-3 text-center">{t.ratePercent}</th>
                      <th className="px-3 py-3 text-right">{t.commissionAmount}</th>
                      <th className="px-3 py-3 text-center">{t.status}</th>
                      <th className="px-3 py-3 text-center">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                    {records.map((r) => (
                      <tr key={r.id} className="transition hover:bg-white/[0.04]">
                        <td className="px-3 py-3 text-center">
                          {!r.isPaid && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(r.id)}
                              onChange={() => toggleSelect(r.id)}
                              className="rounded accent-purple-500"
                            />
                          )}
                        </td>
                        <td className={`px-3 py-3 ${isDark ? "text-white/60" : "text-gray-600"} whitespace-nowrap`}>
                          {formatDate(r.appointmentDate)}
                        </td>
                        <td className="px-3 py-3 font-medium">{r.staffFullName}</td>
                        <td className={`px-3 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{r.treatmentName}</td>
                        <td className={`px-3 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{r.customerFullName}</td>
                        <td className={`px-3 py-3 text-right ${isDark ? "text-white" : "text-gray-900"}`}>
                          {fmt(r.paymentAmountInTry)} {t.currency}
                        </td>
                        <td className={`px-3 py-3 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>%{r.commissionRate}</td>
                        <td className="px-3 py-3 text-right font-medium text-amber-400">
                          {fmt(r.commissionAmountInTry)} {t.currency}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              r.isPaid
                                ? "bg-green-500/15 text-green-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}
                          >
                            {r.isPaid ? t.paidLabel : t.unpaidLabel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {!r.isPaid && (
                            <button
                              onClick={() => handlePaySingle(r.id)}
                              className={`rounded-lg bg-green-600/80 px-3 py-1 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition hover:bg-green-600`}
                            >
                              {t.markPaid}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]" : "bg-white"} p-6 shadow-2xl`}>
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.confirmPayTitle}</h3>
            <p className={`mt-3 text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>{modal.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModal((p) => ({ ...p, show: false }))}
                className={`rounded-xl ${isDark ? "bg-white/10" : "bg-gray-100"} px-5 py-2 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} transition hover:bg-white/20`}
              >
                {t.cancel}
              </button>
              <button
                onClick={modal.onConfirm}
                className={`rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-500/20 transition hover:shadow-green-500/30`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────── Sub-components ────────────────────────────── */

function SummaryCard({ label,
  value,
  currency,
  color,
  bgGlow, isDark }: { label: string;
  value: string;
  currency: string;
  color: string;
  bgGlow: string; isDark: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} bg-gradient-to-br ${bgGlow} to-transparent p-5`}
    >
      <p className={`text-xs font-medium tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {value} <span className={`text-sm font-normal ${isDark ? "text-white/40" : "text-gray-400"}`}>{currency}</span>
      </p>
    </div>
  );
}

function LoadingState({ text, isDark }: { text: string; isDark: boolean }) {
  return <div className={`p-8 text-center ${isDark ? "text-white/50" : "text-gray-500"}`}>{text}</div>;
}

function EmptyState({ text, isDark }: { text: string; isDark: boolean }) {
  return <div className={`p-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{text}</div>;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commissionService } from "@/services/commissionService";
import { staffService } from "@/services/staffService";
import { treatmentService } from "@/services/treatmentService";
import type {
  StaffCommissionSummary,
  StaffCommissionRecord,
  StaffCommissionRate,
  StaffMember,
  TreatmentListItem,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Commission Management",
    tabs: ["Summary", "Records", "Set Rates"],
    loading: "Loading...",
    noData: "No data found.",
    // Summary
    staff: "Staff",
    totalRevenue: "Total Revenue",
    commission: "Commission",
    salonShare: "Salon Share",
    paid: "Paid",
    unpaid: "Unpaid",
    records: "Records",
    // Records
    treatment: "Treatment",
    customer: "Customer",
    date: "Date",
    amount: "Amount",
    rate: "Rate",
    commissionAmount: "Commission",
    status: "Status",
    paidLabel: "Paid",
    unpaidLabel: "Unpaid",
    markPaid: "Mark as Paid",
    markPaidConfirm: "Mark selected records as paid?",
    selectAll: "Select All",
    // Set Rates
    selectStaff: "Select staff...",
    defaultRate: "Default Commission Rate (%)",
    treatmentRates: "Per-Treatment Rates",
    save: "Save",
    saving: "Saving...",
    saved: "Commission rates saved.",
    addTreatment: "+ Add Treatment Rate",
    startDate: "Start Date",
    endDate: "End Date",
    filter: "Filter",
    filterByStaff: "Filter by staff",
    all: "All",
  },
  tr: {
    title: "Komisyon Yönetimi",
    tabs: ["Özet", "Kayıtlar", "Oran Ayarla"],
    loading: "Yükleniyor...",
    noData: "Veri bulunamadı.",
    staff: "Personel",
    totalRevenue: "Toplam Gelir",
    commission: "Komisyon",
    salonShare: "Salon Payı",
    paid: "Ödenen",
    unpaid: "Ödenmemiş",
    records: "Kayıt",
    treatment: "Hizmet",
    customer: "Müşteri",
    date: "Tarih",
    amount: "Tutar",
    rate: "Oran",
    commissionAmount: "Komisyon",
    status: "Durum",
    paidLabel: "Ödendi",
    unpaidLabel: "Ödenmedi",
    markPaid: "Ödendi İşaretle",
    markPaidConfirm: "Seçili kayıtları ödendi olarak işaretlemek istiyor musunuz?",
    selectAll: "Tümünü Seç",
    selectStaff: "Personel seçin...",
    defaultRate: "Genel Komisyon Oranı (%)",
    treatmentRates: "Hizmet Bazlı Oranlar",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Komisyon oranları kaydedildi.",
    addTreatment: "+ Hizmet Oranı Ekle",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    filter: "Filtrele",
    filterByStaff: "Personele göre",
    all: "Tümü",
  },
};

export default function CommissionScreen() {
  const { language } = useLanguage();
  const text = copy[language];
  const [activeTab, setActiveTab] = useState(0);

  // Summary
  const [summaries, setSummaries] = useState<StaffCommissionSummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Records
  const [records, setRecords] = useState<StaffCommissionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffFilter, setStaffFilter] = useState<number | "">("");

  // Set Rates
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  const [rateData, setRateData] = useState<StaffCommissionRate | null>(null);
  const [defaultRate, setDefaultRate] = useState(0);
  const [treatmentRates, setTreatmentRates] = useState<{ treatmentId: number; commissionRate: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

  // ── Fetch ──

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await commissionService.getSummary(
        Object.keys(params).length > 0 ? params : undefined,
      );
      if (res.data.success && res.data.data) setSummaries(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Özet yüklenemedi" : "Failed to load summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [startDate, endDate, language]);

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffFilter !== "") params.staffId = staffFilter;
      const res = await commissionService.getRecords(
        Object.keys(params).length > 0
          ? (params as { startDate?: string; endDate?: string; staffId?: number })
          : undefined,
      );
      if (res.data.success && res.data.data) setRecords(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Kayıtlar yüklenemedi" : "Failed to load records");
    } finally {
      setRecordsLoading(false);
    }
  }, [startDate, endDate, staffFilter, language]);

  const fetchStaffAndTreatments = useCallback(async () => {
    try {
      const [sRes, tRes] = await Promise.all([staffService.list(), treatmentService.list()]);
      if (sRes.data.success && sRes.data.data) setStaffList(sRes.data.data as StaffMember[]);
      if (tRes.data.success && tRes.data.data) setTreatments(tRes.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchSummary(); fetchRecords(); }, [fetchSummary, fetchRecords]);
  useEffect(() => { fetchStaffAndTreatments(); }, [fetchStaffAndTreatments]);

  // ── Rates ──

  const loadStaffRates = async (staffId: number) => {
    setSelectedStaffId(staffId);
    if (!staffId) { setRateData(null); return; }
    try {
      const res = await commissionService.getStaffRates(staffId);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setRateData(d);
        setDefaultRate(d.defaultCommissionRate);
        setTreatmentRates(d.treatmentCommissions.map((t) => ({ treatmentId: t.treatmentId, commissionRate: t.commissionRate })));
      }
    } catch {
      toast.error(language === "tr" ? "Oranlar yüklenemedi" : "Failed to load rates");
    }
  };

  const handleSaveRates = async () => {
    if (!selectedStaffId) return;
    setSaving(true);
    try {
      await commissionService.setStaffRates(selectedStaffId, {
        defaultCommissionRate: defaultRate,
        treatmentRates: treatmentRates.length > 0 ? treatmentRates : undefined,
      });
      toast.success(text.saved);
    } catch {
      toast.error(language === "tr" ? "Kayıt başarısız" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Mark Paid ──

  const handleMarkPaid = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(text.markPaidConfirm)) return;
    try {
      await commissionService.markPaid([...selectedIds]);
      toast.success(language === "tr" ? "Komisyonlar ödendi olarak işaretlendi" : "Commissions marked as paid");
      setSelectedIds(new Set());
      fetchRecords();
      fetchSummary();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const unpaid = records.filter((r) => !r.isPaid);
    if (selectedIds.size === unpaid.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(unpaid.map((r) => r.id)));
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none";

  return (
    <div className="space-y-4 text-white">
      <h1 className="text-2xl font-semibold">{text.title}</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {text.tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${activeTab === i ? "bg-[#7c5cbf] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab !== 2 && (
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none" />
          {activeTab === 1 && (
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value ? Number(e.target.value) : "")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none">
              <option value="" className="bg-[#1a1a2e]">{text.all}</option>
              {staffList.map((s) => <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name} {s.surname}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Tab 0: Summary */}
      {activeTab === 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
          {summaryLoading ? (
            <div className="p-8 text-center text-white/60">{text.loading}</div>
          ) : summaries.length === 0 ? (
            <div className="p-8 text-center text-white/60">{text.noData}</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                  <th className="px-4 py-3">{text.staff}</th>
                  <th className="px-4 py-3">{text.totalRevenue}</th>
                  <th className="px-4 py-3">{text.commission}</th>
                  <th className="px-4 py-3">{text.salonShare}</th>
                  <th className="px-4 py-3">{text.paid}</th>
                  <th className="px-4 py-3">{text.unpaid}</th>
                  <th className="px-4 py-3">{text.records}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summaries.map((s) => (
                  <tr key={s.staffId} className="transition hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{s.staffFullName}</td>
                    <td className="px-4 py-3 text-white/60">{fmt(s.totalPaymentsInTry)} TRY</td>
                    <td className="px-4 py-3 text-[#f59e0b] font-medium">{fmt(s.totalCommissionInTry)} TRY</td>
                    <td className="px-4 py-3 text-[#10b981]">{fmt(s.totalSalonShareInTry)} TRY</td>
                    <td className="px-4 py-3 text-white/60">{fmt(s.paidCommissionInTry)} TRY</td>
                    <td className="px-4 py-3 text-red-400">{fmt(s.unpaidCommissionInTry)} TRY</td>
                    <td className="px-4 py-3 text-white/40">{s.recordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 1: Records */}
      {activeTab === 1 && (
        <>
          {selectedIds.size > 0 && (
            <button onClick={handleMarkPaid}
              className="rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#008f45]">
              {text.markPaid} ({selectedIds.size})
            </button>
          )}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
            {recordsLoading ? (
              <div className="p-8 text-center text-white/60">{text.loading}</div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-white/60">{text.noData}</div>
            ) : (
              <table className="w-full text-left text-[10px] md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                    <th className="px-3 py-3">
                      <input type="checkbox" checked={selectedIds.size === records.filter((r) => !r.isPaid).length && selectedIds.size > 0}
                        onChange={toggleSelectAll} className="rounded" />
                    </th>
                    <th className="px-3 py-3">{text.staff}</th>
                    <th className="px-3 py-3">{text.customer}</th>
                    <th className="px-3 py-3">{text.treatment}</th>
                    <th className="px-3 py-3">{text.date}</th>
                    <th className="px-3 py-3">{text.amount}</th>
                    <th className="px-3 py-3">{text.rate}</th>
                    <th className="px-3 py-3">{text.commissionAmount}</th>
                    <th className="px-3 py-3">{text.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((r) => (
                    <tr key={r.id} className="transition hover:bg-white/5">
                      <td className="px-3 py-3">
                        {!r.isPaid && (
                          <input type="checkbox" checked={selectedIds.has(r.id)}
                            onChange={() => toggleSelect(r.id)} className="rounded" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-white/80">{r.staffFullName}</td>
                      <td className="px-3 py-3 text-white/60">{r.customerFullName}</td>
                      <td className="px-3 py-3 text-white/60">{r.treatmentName}</td>
                      <td className="px-3 py-3 text-white/60">{formatDate(r.appointmentDate)}</td>
                      <td className="px-3 py-3 text-white">{fmt(r.paymentAmountInTry)} TRY</td>
                      <td className="px-3 py-3 text-white/60">%{r.commissionRate}</td>
                      <td className="px-3 py-3 text-[#f59e0b] font-medium">{fmt(r.commissionAmountInTry)} TRY</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.isPaid ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {r.isPaid ? text.paidLabel : text.unpaidLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Set Rates */}
      {activeTab === 2 && (
        <div className="max-w-2xl space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.selectStaff}</label>
            <select value={selectedStaffId} onChange={(e) => loadStaffRates(Number(e.target.value))} className={inputClass}>
              <option value={0} className="bg-[#1a1a2e]">{text.selectStaff}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1a1a2e]">
                  {s.name} {s.surname} {s.defaultCommissionRate > 0 ? `(%${s.defaultCommissionRate})` : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedStaffId > 0 && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">{text.defaultRate}</label>
                <input type="number" min={0} max={100} step={0.5} value={defaultRate}
                  onChange={(e) => setDefaultRate(Number(e.target.value))} className={inputClass} />
              </div>

              <hr className="border-white/10" />

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/60">{text.treatmentRates}</label>
                {treatmentRates.map((tr, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <select value={tr.treatmentId}
                      onChange={(e) => { const n = [...treatmentRates]; n[i].treatmentId = Number(e.target.value); setTreatmentRates(n); }}
                      className={`${inputClass} flex-1`}>
                      <option value={0} className="bg-[#1a1a2e]">---</option>
                      {treatments.map((t) => <option key={t.id} value={t.id} className="bg-[#1a1a2e]">{t.name}</option>)}
                    </select>
                    <input type="number" min={0} max={100} step={0.5} value={tr.commissionRate}
                      onChange={(e) => { const n = [...treatmentRates]; n[i].commissionRate = Number(e.target.value); setTreatmentRates(n); }}
                      className={`${inputClass} w-24`} placeholder="%" />
                    <button onClick={() => setTreatmentRates(treatmentRates.filter((_, j) => j !== i))}
                      className="flex h-8 w-8 items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      x
                    </button>
                  </div>
                ))}
                <button onClick={() => setTreatmentRates([...treatmentRates, { treatmentId: 0, commissionRate: 0 }])}
                  className="text-xs text-[#7c5cbf] hover:text-[#a18ddc]">
                  {text.addTreatment}
                </button>
              </div>

              <button onClick={handleSaveRates} disabled={saving}
                className="w-full rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50">
                {saving ? text.saving : text.save}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

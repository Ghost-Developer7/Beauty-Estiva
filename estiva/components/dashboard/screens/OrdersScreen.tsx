"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentService } from "@/services/paymentService";
import { appointmentService } from "@/services/appointmentService";
import { customerService } from "@/services/customerService";
import { treatmentService } from "@/services/treatmentService";
import { currencyService } from "@/services/currencyService";
import { staffService, type StaffMember } from "@/services/staffService";
import type {
  AppointmentPaymentItem,
  AppointmentListItem,
  CustomerListItem,
  TreatmentListItem,
  CurrencyItem,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const PAYMENT_METHODS: { value: string; en: string; tr: string; icon: string }[] = [
  { value: "Cash", en: "Cash", tr: "Nakit", icon: "💵" },
  { value: "CreditCard", en: "Credit Card", tr: "Kredi Kartı", icon: "💳" },
  { value: "BankTransfer", en: "Bank Transfer", tr: "Havale/EFT", icon: "🏦" },
  { value: "Check", en: "Check", tr: "Çek", icon: "📄" },
  { value: "Other", en: "Other", tr: "Diğer", icon: "📋" },
];

const METHOD_COLORS: Record<string, string> = {
  "Nakit": "#22c55e",
  "Cash": "#22c55e",
  "Kredi / Banka Kartı": "#6366f1",
  "Credit Card": "#6366f1",
  "Havale / EFT": "#3b82f6",
  "Bank Transfer": "#3b82f6",
  "Çek": "#f59e0b",
  "Check": "#f59e0b",
  "Diğer": "#8b5cf6",
  "Other": "#8b5cf6",
};

const copy = {
  en: {
    title: "Orders / Payments",
    newPayment: "New Payment",
    total: "total",
    loading: "Loading...",
    noData: "No payment records yet.",
    noDataSub: "Record your first payment after completing an appointment.",
    // Filters
    allStaff: "All Staff",
    startDate: "Start",
    endDate: "End",
    search: "Search...",
    // Stats
    totalRevenue: "Total Revenue",
    avgPayment: "Avg Payment",
    totalPayments: "Payments",
    topMethod: "Top Method",
    // Table
    customer: "Customer",
    treatment: "Treatment",
    staffMember: "Staff",
    date: "Date",
    amount: "Amount",
    method: "Method",
    actions: "",
    // Create modal
    createTitle: "Record Payment",
    appointment: "Appointment",
    searchAppointment: "Search appointment...",
    paymentAmount: "Amount",
    currency: "Currency",
    exchangeRate: "Exchange Rate",
    paymentMethod: "Payment Method",
    notes: "Notes",
    notesPlaceholder: "Optional notes...",
    save: "Record Payment",
    saving: "Recording...",
    cancel: "Cancel",
    selectAppointment: "Select an appointment",
    noAppointments: "No appointments found",
    // Detail
    detailTitle: "Payment Detail",
    appointmentDate: "Appointment Date",
    paidAt: "Paid At",
    originalAmount: "Original Amount",
    tryAmount: "TRY Amount",
    deletePayment: "Delete Payment",
    confirmDelete: "Delete this payment record?",
    // Quick appointment
    newAppointment: "New Appointment",
    apptCustomer: "Customer",
    searchCustomer: "Search customer...",
    newCustomer: "New Customer",
    customerName: "Name",
    customerSurname: "Surname",
    customerPhone: "Phone",
    apptTreatment: "Treatment",
    apptStaff: "Staff",
    anyStaff: "Any available",
    apptDateTime: "Date & Time",
    apptNotes: "Notes",
    createAppointment: "Create Appointment",
    creatingAppointment: "Creating...",
    min: "min",
  },
  tr: {
    title: "Adisyonlar / Ödemeler",
    newPayment: "Yeni Ödeme",
    total: "toplam",
    loading: "Yükleniyor...",
    noData: "Henüz ödeme kaydı yok.",
    noDataSub: "Randevu tamamlandıktan sonra ilk ödemenizi kaydedin.",
    allStaff: "Tüm Personel",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    search: "Ara...",
    totalRevenue: "Toplam Gelir",
    avgPayment: "Ort. Ödeme",
    totalPayments: "Ödeme Sayısı",
    topMethod: "En Çok Kullanılan",
    customer: "Müşteri",
    treatment: "Hizmet",
    staffMember: "Personel",
    date: "Tarih",
    amount: "Tutar",
    method: "Yöntem",
    actions: "",
    createTitle: "Ödeme Kaydet",
    appointment: "Randevu",
    searchAppointment: "Randevu ara...",
    paymentAmount: "Tutar",
    currency: "Para Birimi",
    exchangeRate: "Döviz Kuru",
    paymentMethod: "Ödeme Yöntemi",
    notes: "Notlar",
    notesPlaceholder: "İsteğe bağlı notlar...",
    save: "Ödeme Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    selectAppointment: "Randevu seçin",
    noAppointments: "Randevu bulunamadı",
    detailTitle: "Ödeme Detayı",
    appointmentDate: "Randevu Tarihi",
    paidAt: "Ödeme Tarihi",
    originalAmount: "Orijinal Tutar",
    tryAmount: "TRY Tutar",
    deletePayment: "Ödemeyi Sil",
    confirmDelete: "Bu ödeme kaydını silmek istiyor musunuz?",
    newAppointment: "Yeni Randevu",
    apptCustomer: "Müşteri",
    searchCustomer: "Müşteri ara...",
    newCustomer: "Yeni Müşteri",
    customerName: "Ad",
    customerSurname: "Soyad",
    customerPhone: "Telefon",
    apptTreatment: "Hizmet",
    apptStaff: "Personel",
    anyStaff: "Uygun herhangi biri",
    apptDateTime: "Tarih & Saat",
    apptNotes: "Notlar",
    createAppointment: "Randevu Oluştur",
    creatingAppointment: "Oluşturuluyor...",
    min: "dk",
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

const formatDateTime = (d: string) => `${formatDate(d)} ${formatTime(d)}`;

function getMethodColor(display: string) {
  return METHOD_COLORS[display] || "#8b5cf6";
}

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-white/30">{sub}</p>}
    </div>
  );
}

function MethodBadge({ display, language }: { display: string; language: "en" | "tr" }) {
  const color = getMethodColor(display);
  const method = PAYMENT_METHODS.find(m =>
    m.en.toLowerCase() === display.toLowerCase() ||
    m.tr.toLowerCase() === display.toLowerCase() ||
    display.includes(m.en) || display.includes(m.tr)
  );
  const label = method ? (language === "tr" ? method.tr : method.en) : display;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium border"
      style={{ backgroundColor: `${color}12`, color, borderColor: `${color}30` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function OrdersScreen() {
  const { language } = useLanguage();
  const t = copy[language];

  /* ─── Data ─── */
  const [payments, setPayments] = useState<AppointmentPaymentItem[]>([]);

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Filters ─── */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffFilter, setStaffFilter] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ─── Create Modal ─── */
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    appointmentId: 0,
    amount: 0,
    currencyId: 0,
    exchangeRateToTry: 1,
    paymentMethod: "Cash",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);
  const appointmentDropdownRef = useRef<HTMLDivElement>(null);

  /* ─── Detail Modal ─── */
  const [selectedPayment, setSelectedPayment] = useState<AppointmentPaymentItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  /* ─── Appointment Create Modal ─── */
  const [showApptCreate, setShowApptCreate] = useState(false);
  const [apptForm, setApptForm] = useState({ customerId: 0, isNewCustomer: false, newName: "", newSurname: "", newPhone: "", treatmentId: 0, staffId: 0, startTime: "", notes: "" });
  const [apptSaving, setApptSaving] = useState(false);
  const [apptCustomerSearch, setApptCustomerSearch] = useState("");
  const [showApptCustomerDropdown, setShowApptCustomerDropdown] = useState(false);
  const apptCustomerDropdownRef = useRef<HTMLDivElement>(null);

  /* ═══ DATA FETCHING ═══ */

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: { startDate?: string; endDate?: string; staffId?: number; pageNumber?: number; pageSize?: number } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffFilter) params.staffId = staffFilter;
      params.pageNumber = page;
      params.pageSize = pageSize;
      const res = await paymentService.listPaginated(params);
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setPayments(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const params: { startDate?: string; endDate?: string; staffId?: number } = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (staffFilter) params.staffId = staffFilter;
        const res = await paymentService.list(Object.keys(params).length > 0 ? params : undefined);
        if (res.data.success && res.data.data) {
          setPayments(res.data.data);
          setTotalCount(res.data.data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(language === "tr" ? "Ödemeler yüklenemedi" : "Failed to load payments");
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, staffFilter, page, pageSize, language]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [apptRes, currRes, staffRes, custRes, treatRes] = await Promise.all([
        appointmentService.list(),
        currencyService.list(),
        staffService.list(),
        customerService.list(),
        treatmentService.list(),
      ]);
      if (apptRes.data.success && apptRes.data.data) setAppointments(apptRes.data.data);
      if (currRes.data.success && currRes.data.data) setCurrencies(currRes.data.data);
      if (staffRes.data.success && staffRes.data.data) setStaffList(staffRes.data.data);
      if (custRes.data.success && custRes.data.data) setCustomers(custRes.data.data);
      if (treatRes.data.success && treatRes.data.data) setTreatments(treatRes.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appointmentDropdownRef.current && !appointmentDropdownRef.current.contains(e.target as Node)) {
        setShowAppointmentDropdown(false);
      }
      if (apptCustomerDropdownRef.current && !apptCustomerDropdownRef.current.contains(e.target as Node)) {
        setShowApptCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ═══ FILTERED DATA ═══ */

  const filtered = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.customerFullName?.toLowerCase().includes(q) ||
      p.treatmentName?.toLowerCase().includes(q) ||
      p.staffFullName?.toLowerCase().includes(q)
    );
  });

  /* ═══ STATS ═══ */

  const totalRevenue = filtered.reduce((sum, p) => sum + p.amountInTry, 0);
  const avgPayment = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  // Most used method
  const methodCounts = filtered.reduce<Record<string, number>>((acc, p) => {
    const key = p.paymentMethodDisplay || "Diğer";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];

  /* ═══ APPOINTMENT SEARCH ═══ */

  const filteredAppointments = appointments.filter((a) => {
    if (!appointmentSearch) return true;
    const q = appointmentSearch.toLowerCase();
    return (
      a.customerFullName.toLowerCase().includes(q) ||
      a.treatmentName.toLowerCase().includes(q) ||
      `#${a.id}`.includes(q)
    );
  });

  const selectAppointment = (a: AppointmentListItem) => {
    setForm({ ...form, appointmentId: a.id });
    setAppointmentSearch(`#${a.id} — ${a.customerFullName} — ${a.treatmentName}`);
    setShowAppointmentDropdown(false);
  };

  /* ═══ CURRENCY CHANGE ═══ */

  const handleCurrencyChange = (currencyId: number) => {
    const curr = currencies.find(c => c.id === currencyId);
    setForm({
      ...form,
      currencyId,
      exchangeRateToTry: curr?.exchangeRateToTry || 1,
    });
  };

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    const defaultCurrency = currencies.find(c => c.isDefault) || currencies[0];
    setForm({
      appointmentId: 0,
      amount: 0,
      currencyId: defaultCurrency?.id || 0,
      exchangeRateToTry: defaultCurrency?.exchangeRateToTry || 1,
      paymentMethod: "Cash",
      notes: "",
    });
    setAppointmentSearch("");
    setShowCreate(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.appointmentId) {
      toast.error(language === "tr" ? "Randevu seçimi zorunludur" : "Appointment is required");
      return;
    }
    if (form.amount <= 0) {
      toast.error(language === "tr" ? "Tutar 0'dan büyük olmalıdır" : "Amount must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      await paymentService.create({
        appointmentId: form.appointmentId,
        amount: form.amount,
        currencyId: form.currencyId || undefined,
        exchangeRateToTry: form.exchangeRateToTry,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
      });
      toast.success(language === "tr" ? "Ödeme kaydedildi" : "Payment recorded");
      setShowCreate(false);
      fetchPayments();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (p: AppointmentPaymentItem) => {
    setSelectedPayment(p);
    setShowDetail(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await paymentService.delete(id);
      toast.success(language === "tr" ? "Ödeme silindi" : "Payment deleted");
      setShowDetail(false);
      fetchPayments();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  /* ═══ APPOINTMENT CREATE ═══ */

  const openApptCreate = () => {
    setApptForm({ customerId: 0, isNewCustomer: false, newName: "", newSurname: "", newPhone: "", treatmentId: 0, staffId: 0, startTime: "", notes: "" });
    setApptCustomerSearch("");
    setShowApptCreate(true);
  };

  const filteredApptCustomers = customers.filter((c) => {
    if (!apptCustomerSearch) return true;
    const q = apptCustomerSearch.toLowerCase();
    return `${c.name} ${c.surname}`.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const handleApptSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let customerId = apptForm.customerId;

    if (apptForm.isNewCustomer) {
      if (!apptForm.newName.trim() || !apptForm.newSurname.trim()) {
        toast.error(language === "tr" ? "Müşteri adı ve soyadı zorunludur" : "Customer name and surname are required");
        return;
      }
      try {
        const res = await customerService.create({ name: apptForm.newName.trim(), surname: apptForm.newSurname.trim(), phone: apptForm.newPhone.trim() || undefined });
        if (res.data.success && res.data.data) {
          customerId = res.data.data.id;
          const custRes = await customerService.list();
          if (custRes.data.success && custRes.data.data) setCustomers(custRes.data.data);
        } else {
          toast.error(res.data.error?.message || (language === "tr" ? "Müşteri oluşturulamadı" : "Failed to create customer"));
          return;
        }
      } catch {
        toast.error(language === "tr" ? "Müşteri oluşturulamadı" : "Failed to create customer");
        return;
      }
    }

    if (!customerId || !apptForm.treatmentId || !apptForm.startTime) {
      toast.error(language === "tr" ? "Müşteri, hizmet ve tarih zorunludur" : "Customer, treatment and date are required");
      return;
    }

    setApptSaving(true);
    try {
      await appointmentService.create({
        customerId,
        staffId: apptForm.staffId || 0,
        treatmentId: apptForm.treatmentId,
        startTime: apptForm.startTime,
        notes: apptForm.notes || undefined,
      });
      toast.success(language === "tr" ? "Randevu oluşturuldu" : "Appointment created");
      setShowApptCreate(false);
      // Refresh appointments for payment dropdown
      const apptRes = await appointmentService.list();
      if (apptRes.data.success && apptRes.data.data) setAppointments(apptRes.data.data);
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setApptSaving(false);
    }
  };

  const STAFF_COLORS = ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c"];
  const getStaffColor = (id: number) => STAFF_COLORS[id % STAFF_COLORS.length];

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-5 text-white">

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{filtered.length} {t.total}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons
            data={filtered as unknown as Record<string, unknown>[]}
            columns={((): ExportColumn[] => {
              const isTr = language === "tr";
              return [
                { header: isTr ? "Müşteri" : "Customer", key: "customerFullName" },
                { header: isTr ? "Hizmet" : "Treatment", key: "treatmentName" },
                { header: isTr ? "Personel" : "Staff", key: "staffFullName" },
                { header: isTr ? "Tarih" : "Date", key: "paidAt", format: "datetime" },
                { header: isTr ? "Tutar" : "Amount", key: "amountInTry", format: "currency" },
                { header: isTr ? "Yöntem" : "Method", key: "paymentMethodDisplay" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Odemeler" : "Payments"}
            pdfTitle={language === "tr" ? "Ödeme Listesi" : "Payments List"}
          />
          <button
            onClick={openApptCreate}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {t.newAppointment}
          </button>
          <button
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:shadow-indigo-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {t.newPayment}
        </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.totalRevenue} value={`₺${fmt(totalRevenue)}`} color="#22c55e" />
        <StatCard label={t.avgPayment} value={`₺${fmt(avgPayment)}`} color="#6366f1" />
        <StatCard label={t.totalPayments} value={String(filtered.length)} color="#3b82f6" />
        <StatCard
          label={t.topMethod}
          value={topMethod ? topMethod[0] : "—"}
          sub={topMethod ? `${topMethod[1]}x` : ""}
          color="#f59e0b"
        />
      </div>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
          title={t.startDate}
        />
        <span className="text-white/20">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
          title={t.endDate}
        />

        <div className="h-6 w-px bg-white/10" />

        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="" className="bg-[#1a1a2e]">{t.allStaff}</option>
          {staffList.filter(s => s.isActive).map((s) => (
            <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name} {s.surname}</option>
          ))}
        </select>

        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 w-48"
          />
        </div>
      </div>

      {/* ─── PAYMENT LIST ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
            <p className="text-sm font-medium text-white/40">{t.noData}</p>
            <p className="text-xs text-white/25">{t.noDataSub}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_0.8fr_0.6fr_0.7fr_0.7fr_auto] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              <span>{t.customer}</span>
              <span>{t.treatment}</span>
              <span>{t.staffMember}</span>
              <span>{t.date}</span>
              <span>{t.amount}</span>
              <span>{t.method}</span>
              <span>{t.actions}</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((p) => {
                const methodColor = getMethodColor(p.paymentMethodDisplay);
                return (
                  <div
                    key={p.id}
                    onClick={() => openDetail(p)}
                    className="group grid grid-cols-1 md:grid-cols-[1fr_1fr_0.8fr_0.6fr_0.7fr_0.7fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                  >
                    {/* Customer */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-[10px] font-bold text-white/70">
                        {p.customerFullName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.customerFullName || `#${p.appointmentId}`}</p>
                        <p className="text-[10px] text-white/30 md:hidden">{p.treatmentName}</p>
                      </div>
                    </div>

                    {/* Treatment */}
                    <p className="hidden md:block text-xs text-white/60 truncate">{p.treatmentName}</p>

                    {/* Staff */}
                    <p className="hidden md:block text-xs text-white/50 truncate">{p.staffFullName}</p>

                    {/* Date */}
                    <div className="hidden md:block">
                      <p className="text-xs text-white/60">{formatDate(p.paidAt)}</p>
                      <p className="text-[10px] text-white/30">{formatTime(p.paidAt)}</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-sm font-bold text-white">
                        {p.currencySymbol}{fmt(p.amount)}
                      </p>
                      {p.currencyCode !== "TRY" && (
                        <p className="text-[10px] text-white/30">₺{fmt(p.amountInTry)}</p>
                      )}
                    </div>

                    {/* Method */}
                    <MethodBadge display={p.paymentMethodDisplay} language={language} />

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                        title={t.deletePayment}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer totals */}
            <Pagination
              pageNumber={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.03] px-5 py-3">
              <span className="text-xs text-white/40">{filtered.length} {t.total}</span>
              <span className="text-sm font-bold text-emerald-400">₺{fmt(totalRevenue)}</span>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
         CREATE PAYMENT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t.createTitle} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Appointment Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.appointment}</label>
            <div className="relative" ref={appointmentDropdownRef}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                value={appointmentSearch}
                onChange={(e) => { setAppointmentSearch(e.target.value); setShowAppointmentDropdown(true); }}
                onFocus={() => setShowAppointmentDropdown(true)}
                placeholder={t.searchAppointment}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
              />
              {showAppointmentDropdown && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e] shadow-xl">
                  {filteredAppointments.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-white/30">{t.noAppointments}</div>
                  ) : (
                    filteredAppointments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => selectAppointment(a)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5 ${form.appointmentId === a.id ? "bg-white/5" : ""}`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-[10px] font-bold text-white/60">
                          #{a.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{a.customerFullName}</p>
                          <p className="text-[10px] text-white/30">{a.treatmentName} • {formatDateTime(a.startTime)}</p>
                        </div>
                        {form.appointmentId === a.id && (
                          <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentAmount}</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.currency}</label>
              <select
                value={form.currencyId}
                onChange={(e) => handleCurrencyChange(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a2e]">
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.exchangeRate}</label>
              <input
                type="number"
                min={0}
                step={0.0001}
                value={form.exchangeRateToTry}
                onChange={(e) => setForm({ ...form, exchangeRateToTry: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
              {form.amount > 0 && form.exchangeRateToTry !== 1 && (
                <p className="text-[10px] text-white/30">= ₺{fmt(form.amount * form.exchangeRateToTry)}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentMethod}</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: m.value })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
                    form.paymentMethod === m.value
                      ? "border-white/20 bg-white/10 ring-1 ring-white/20"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-[10px] font-medium text-white/60">{language === "tr" ? m.tr : m.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.notes}</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t.notesPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:shadow-indigo-900/50 disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════
         PAYMENT DETAIL MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={t.detailTitle} maxWidth="max-w-md">
        {selectedPayment && (() => {
          const p = selectedPayment;
          const methodColor = getMethodColor(p.paymentMethodDisplay);
          return (
            <div className="space-y-5">
              {/* Amount hero */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] py-5">
                <p className="text-3xl font-bold text-white">{p.currencySymbol}{fmt(p.amount)}</p>
                {p.currencyCode !== "TRY" && (
                  <p className="text-sm text-white/40">₺{fmt(p.amountInTry)}</p>
                )}
                <MethodBadge display={p.paymentMethodDisplay} language={language} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.customer}</p>
                  <p className="text-sm text-white">{p.customerFullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.treatment}</p>
                  <p className="text-sm text-white">{p.treatmentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.staffMember}</p>
                  <p className="text-sm text-white">{p.staffFullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.appointmentDate}</p>
                  <p className="text-sm text-white">{formatDateTime(p.appointmentStartTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.paidAt}</p>
                  <p className="text-sm text-white">{formatDateTime(p.paidAt)}</p>
                </div>
                {p.currencyCode !== "TRY" && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.exchangeRate}</p>
                    <p className="text-sm text-white">1 {p.currencyCode} = ₺{fmt(p.exchangeRateToTry)}</p>
                  </div>
                )}
                {p.notes && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.notes}</p>
                    <p className="text-sm text-white/70">{p.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 transition hover:bg-red-500/20"
                >
                  {t.deletePayment}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ═══════════════════════════════════════════
         APPOINTMENT CREATE MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showApptCreate} onClose={() => setShowApptCreate(false)} title={t.newAppointment} maxWidth="max-w-2xl">
        <form onSubmit={handleApptSubmit} className="space-y-5">

          {/* Customer */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.apptCustomer}</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setApptForm({ ...apptForm, isNewCustomer: false })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${!apptForm.isNewCustomer ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
                {t.searchCustomer.split("...")[0]}
              </button>
              <button type="button" onClick={() => setApptForm({ ...apptForm, isNewCustomer: true, customerId: 0 })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${apptForm.isNewCustomer ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
                + {t.newCustomer}
              </button>
            </div>
            {!apptForm.isNewCustomer ? (
              <div className="relative" ref={apptCustomerDropdownRef}>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" value={apptCustomerSearch}
                  onChange={(e) => { setApptCustomerSearch(e.target.value); setShowApptCustomerDropdown(true); }}
                  onFocus={() => setShowApptCustomerDropdown(true)}
                  placeholder={t.searchCustomer}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                {showApptCustomerDropdown && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e] shadow-xl">
                    {filteredApptCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-white/30">{t.noAppointments}</div>
                    ) : filteredApptCustomers.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setApptForm({ ...apptForm, customerId: c.id, isNewCustomer: false }); setApptCustomerSearch(`${c.name} ${c.surname}`); setShowApptCustomerDropdown(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5 ${apptForm.customerId === c.id ? "bg-white/5" : ""}`}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-[10px] font-bold text-white/70">
                          {c.name[0]}{c.surname[0]}
                        </div>
                        <div>
                          <p className="text-sm text-white">{c.name} {c.surname}</p>
                          {c.phone && <p className="text-[11px] text-white/30">{c.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={apptForm.newName} onChange={(e) => setApptForm({ ...apptForm, newName: e.target.value })} placeholder={t.customerName + " *"}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                <input type="text" value={apptForm.newSurname} onChange={(e) => setApptForm({ ...apptForm, newSurname: e.target.value })} placeholder={t.customerSurname + " *"}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                <input type="text" value={apptForm.newPhone} onChange={(e) => setApptForm({ ...apptForm, newPhone: e.target.value })} placeholder={t.customerPhone}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25" />
              </div>
            )}
          </div>

          {/* Treatment + Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.apptTreatment}</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
                {treatments.map((tr) => (
                  <button key={tr.id} type="button" onClick={() => setApptForm({ ...apptForm, treatmentId: tr.id })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${apptForm.treatmentId === tr.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}>
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tr.color || "#a78bfa" }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{tr.name}</p>
                      <p className="text-[10px] text-white/30">{tr.durationMinutes} {t.min} • ₺{tr.price}</p>
                    </div>
                    {apptForm.treatmentId === tr.id && (
                      <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.apptStaff}</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <button type="button" onClick={() => setApptForm({ ...apptForm, staffId: 0 })}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${apptForm.staffId === 0 ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/50">?</span>
                  <p className="text-xs text-white/50">{t.anyStaff}</p>
                </button>
                {staffList.filter(s => s.isActive).map((s) => (
                  <button key={s.id} type="button" onClick={() => setApptForm({ ...apptForm, staffId: s.id })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${apptForm.staffId === s.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: getStaffColor(s.id) }}>
                      {s.name[0]}{s.surname[0]}
                    </span>
                    <p className="text-xs font-medium text-white">{s.name} {s.surname}</p>
                    {apptForm.staffId === s.id && (
                      <svg className="ml-auto shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.apptDateTime}</label>
              <input type="datetime-local" value={apptForm.startTime} onChange={(e) => setApptForm({ ...apptForm, startTime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.apptNotes}</label>
              <input type="text" value={apptForm.notes} onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })} placeholder={t.notesPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={apptSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50">
              {apptSaving ? t.creatingAppointment : t.createAppointment}
            </button>
            <button type="button" onClick={() => setShowApptCreate(false)}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

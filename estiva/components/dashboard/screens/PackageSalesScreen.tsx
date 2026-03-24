"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { packageSaleService } from "@/services/packageSaleService";
import { customerService } from "@/services/customerService";
import { treatmentService } from "@/services/treatmentService";
import { staffService } from "@/services/staffService";
import type {
  PackageSaleListItem,
  PackageSaleStats,
  CustomerListItem,
  TreatmentListItem,
  StaffMember,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   COPY / I18N
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    title: "Package Sales",
    total: "total",
    newSale: "+ New Package",
    search: "Search customer, treatment...",
    loading: "Loading...",
    noData: "No package sales yet.",
    noDataSub: "Start selling treatment packages to your customers.",
    noResult: "No results match your filter.",
    // Stats
    totalSales: "Total Sales",
    totalRevenue: "Total Revenue",
    activePackages: "Active Packages",
    completedPackages: "Completed",
    // Filters
    allStatuses: "All Status",
    active: "Active",
    completed: "Completed",
    expired: "Expired",
    cancelled: "Cancelled",
    allTreatments: "All Treatments",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    last3Months: "Last 3 Months",
    allTime: "All Time",
    // Table
    saleDate: "Sale Date",
    customer: "Customer",
    treatment: "Treatment",
    sessions: "Sessions",
    progress: "Progress",
    totalPrice: "Total",
    paidAmount: "Paid",
    remainingPayment: "Remaining",
    status: "Status",
    actions: "Actions",
    used: "used",
    remaining: "remaining",
    // Create form
    createTitle: "New Package Sale",
    editTitle: "Edit Package",
    selectCustomer: "Select Customer",
    selectTreatment: "Select Treatment",
    sessionCount: "Number of Sessions",
    packagePrice: "Package Price",
    paymentAmount: "Payment Amount",
    paymentMethod: "Payment Method",
    cash: "Cash",
    creditCard: "Credit / Debit Card",
    bankTransfer: "Bank Transfer",
    check: "Check",
    other: "Other",
    startDate: "Start Date",
    endDate: "End Date (Validity)",
    notes: "Notes",
    notesPlaceholder: "Optional notes...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    // Detail
    detailTitle: "Package Details",
    packageInfo: "Package Info",
    usageHistory: "Usage History",
    paymentHistory: "Payment History",
    recordUsage: "Record Session Usage",
    addPayment: "Add Payment",
    noUsage: "No sessions used yet.",
    noPayments: "No payment records.",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this package sale?",
    session: "Session",
    of: "of",
    validUntil: "Valid Until",
    seller: "Seller",
    createdAt: "Created",
    // Usage modal
    usageTitle: "Record Session Usage",
    usageDate: "Session Date",
    usageStaff: "Staff (optional)",
    selectStaff: "Select Staff",
    usageNotes: "Notes",
    record: "Record",
    recording: "Recording...",
    // Payment modal
    paymentTitle: "Add Payment",
    paymentAmountLabel: "Amount",
    paymentDate: "Payment Date",
  },
  tr: {
    title: "Paket Satislari",
    total: "toplam",
    newSale: "+ Yeni Paket",
    search: "Musteri, hizmet ara...",
    loading: "Yukleniyor...",
    noData: "Henuz paket satisi yok.",
    noDataSub: "Musterilerinize hizmet paketleri satmaya baslayin.",
    noResult: "Filtrenizle eslesen sonuc yok.",
    totalSales: "Toplam Satis",
    totalRevenue: "Toplam Gelir",
    activePackages: "Aktif Paketler",
    completedPackages: "Tamamlanan",
    allStatuses: "Tum Durumlar",
    active: "Aktif",
    completed: "Tamamlandi",
    expired: "Suresi Doldu",
    cancelled: "Iptal",
    allTreatments: "Tum Hizmetler",
    thisMonth: "Bu Ay",
    lastMonth: "Gecen Ay",
    last3Months: "Son 3 Ay",
    allTime: "Tum Zamanlar",
    saleDate: "Satis Tarihi",
    customer: "Musteri",
    treatment: "Hizmet",
    sessions: "Seanslar",
    progress: "Ilerleme",
    totalPrice: "Toplam",
    paidAmount: "Odenen",
    remainingPayment: "Kalan",
    status: "Durum",
    actions: "Islemler",
    used: "kullanildi",
    remaining: "kalan",
    createTitle: "Yeni Paket Satisi",
    editTitle: "Paket Duzenle",
    selectCustomer: "Musteri Secin",
    selectTreatment: "Hizmet Secin",
    sessionCount: "Seans Sayisi",
    packagePrice: "Paket Fiyati",
    paymentAmount: "Odeme Tutari",
    paymentMethod: "Odeme Yontemi",
    cash: "Nakit",
    creditCard: "Kredi / Banka Karti",
    bankTransfer: "Havale / EFT",
    check: "Cek",
    other: "Diger",
    startDate: "Baslangic Tarihi",
    endDate: "Bitis Tarihi (Gecerlilik)",
    notes: "Notlar",
    notesPlaceholder: "Istege bagli notlar...",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgec",
    detailTitle: "Paket Detayi",
    packageInfo: "Paket Bilgisi",
    usageHistory: "Kullanim Gecmisi",
    paymentHistory: "Odeme Gecmisi",
    recordUsage: "Seans Kullanimi Kaydet",
    addPayment: "Odeme Ekle",
    noUsage: "Henuz seans kullanilmadi.",
    noPayments: "Odeme kaydi yok.",
    edit: "Duzenle",
    delete: "Sil",
    confirmDelete: "Bu paket satisini silmek istediginize emin misiniz?",
    session: "Seans",
    of: "/",
    validUntil: "Gecerlilik",
    seller: "Satici",
    createdAt: "Olusturulma",
    usageTitle: "Seans Kullanimi Kaydet",
    usageDate: "Seans Tarihi",
    usageStaff: "Personel (istege bagli)",
    selectStaff: "Personel Secin",
    usageNotes: "Notlar",
    record: "Kaydet",
    recording: "Kaydediliyor...",
    paymentTitle: "Odeme Ekle",
    paymentAmountLabel: "Tutar",
    paymentDate: "Odeme Tarihi",
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

const getDateRange = (period: string): { startDate?: string; endDate?: string } => {
  const now = new Date();
  if (period === "this-month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  if (period === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (period === "last-3-months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  return {};
};

const statusColor = (status: number) => {
  switch (status) {
    case 1: return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
    case 2: return { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
    case 3: return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" };
    case 4: return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" };
    default: return { bg: "bg-white/10", text: "text-white/60", border: "border-white/20" };
  }
};

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, sub, icon, gradient }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${gradient} bg-opacity-20`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-white/40">{label}</p>
          <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
          {sub && <p className="text-[10px] text-white/30">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isComplete = used >= total;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-white/40 tabular-nums">{Math.round(pct)}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function PackageSalesScreen() {
  const { language } = useLanguage();
  const t = copy[language];

  /* ─── Data ─── */
  const [sales, setSales] = useState<PackageSaleListItem[]>([]);
  const [stats, setStats] = useState<PackageSaleStats>({ totalSales: 0, totalRevenue: 0, activePackages: 0, completedPackages: 0 });

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Filters ─── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [treatmentFilter, setTreatmentFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState("all");

  /* ─── Create Modal ─── */
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerId: 0,
    treatmentId: 0,
    totalSessions: 8,
    totalPrice: 0,
    paidAmount: 0,
    paymentMethod: "Cash",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");

  /* ─── Detail Modal ─── */
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState<PackageSaleListItem | null>(null);

  /* ─── Usage Modal ─── */
  const [showUsage, setShowUsage] = useState(false);
  const [usageForm, setUsageForm] = useState({ usageDate: new Date().toISOString().split("T")[0], staffId: 0, notes: "" });
  const [recordingUsage, setRecordingUsage] = useState(false);

  /* ─── Payment Modal ─── */
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, paymentMethod: "Cash", paidAt: new Date().toISOString().split("T")[0], notes: "" });
  const [recordingPayment, setRecordingPayment] = useState(false);

  /* ═══ DATA FETCHING ═══ */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(dateFilter);
      const params: Record<string, string | number | undefined> = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (statusFilter) params.status = statusFilter;
      if (treatmentFilter) params.treatmentId = treatmentFilter;

      params.pageNumber = page;
      params.pageSize = pageSize;

      const [salesRes, statsRes] = await Promise.all([
        packageSaleService.listPaginated(params as any),
        packageSaleService.stats(dateRange),
      ]);

      if (salesRes.data.success && salesRes.data.data) {
        const pg = salesRes.data.data;
        setSales(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
      if (statsRes.data.success && statsRes.data.data) setStats(statsRes.data.data);
    } catch {
      try {
        const dateRange = getDateRange(dateFilter);
        const params: Record<string, string | number | undefined> = {};
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
        if (statusFilter) params.status = statusFilter;
        if (treatmentFilter) params.treatmentId = treatmentFilter;
        const [salesRes, statsRes] = await Promise.all([
          packageSaleService.list(params),
          packageSaleService.stats(dateRange),
        ]);
        if (salesRes.data.success && salesRes.data.data) {
          setSales(salesRes.data.data);
          setTotalCount(salesRes.data.data.length);
          setTotalPages(1);
        }
        if (statsRes.data.success && statsRes.data.data) setStats(statsRes.data.data);
      } catch {
        toast.error(language === "tr" ? "Veriler yuklenemedi" : "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, treatmentFilter, page, pageSize, language]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [custRes, treatRes, staffRes] = await Promise.all([
        customerService.list(),
        treatmentService.list(),
        staffService.list(),
      ]);
      if (custRes.data.success && custRes.data.data) setCustomers(custRes.data.data);
      if (treatRes.data.success && treatRes.data.data) setTreatments(treatRes.data.data);
      if (staffRes.data.success && staffRes.data.data) setStaffList(staffRes.data.data);
    } catch {
      /* silently ignore - reference data is optional for display */
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  /* ═══ FILTERED ═══ */

  const filtered = sales.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.customerFullName.toLowerCase().includes(q) ||
      s.treatmentName.toLowerCase().includes(q) ||
      s.staffFullName.toLowerCase().includes(q)
    );
  });

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    setCreateForm({
      customerId: 0, treatmentId: 0, totalSessions: 8, totalPrice: 0, paidAmount: 0,
      paymentMethod: "Cash",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
    });
    setCustomerSearch("");
    setTreatmentSearch("");
    setShowCreate(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.customerId || !createForm.treatmentId) {
      toast.error(language === "tr" ? "Musteri ve hizmet secimi zorunludur" : "Customer and treatment are required");
      return;
    }
    setSaving(true);
    try {
      await packageSaleService.create({
        customerId: createForm.customerId,
        treatmentId: createForm.treatmentId,
        totalSessions: createForm.totalSessions,
        totalPrice: createForm.totalPrice,
        paidAmount: createForm.paidAmount,
        paymentMethod: createForm.paymentMethod,
        startDate: createForm.startDate ? new Date(createForm.startDate).toISOString() : undefined,
        endDate: createForm.endDate ? new Date(createForm.endDate).toISOString() : undefined,
        notes: createForm.notes || undefined,
      });
      toast.success(language === "tr" ? "Paket satisi olusturuldu" : "Package sale created");
      setShowCreate(false);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Islem basarisiz" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (sale: PackageSaleListItem) => {
    try {
      const res = await packageSaleService.getById(sale.id);
      if (res.data.success && res.data.data) {
        setSelectedSale(res.data.data);
      } else {
        setSelectedSale(sale);
      }
    } catch {
      setSelectedSale(sale);
    }
    setShowDetail(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await packageSaleService.delete(id);
      toast.success(language === "tr" ? "Paket satisi silindi" : "Package sale deleted");
      setShowDetail(false);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Silme basarisiz" : "Delete failed");
    }
  };

  const openUsage = () => {
    setUsageForm({ usageDate: new Date().toISOString().split("T")[0], staffId: 0, notes: "" });
    setShowUsage(true);
  };

  const handleRecordUsage = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    setRecordingUsage(true);
    try {
      await packageSaleService.recordUsage(selectedSale.id, {
        usageDate: usageForm.usageDate ? new Date(usageForm.usageDate).toISOString() : undefined,
        staffId: usageForm.staffId || undefined,
        notes: usageForm.notes || undefined,
      });
      toast.success(language === "tr" ? "Seans kullanimi kaydedildi" : "Session usage recorded");
      setShowUsage(false);
      // Refresh detail
      const res = await packageSaleService.getById(selectedSale.id);
      if (res.data.success && res.data.data) setSelectedSale(res.data.data);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "tr" ? "Islem basarisiz" : "Operation failed");
      toast.error(msg);
    } finally {
      setRecordingUsage(false);
    }
  };

  const openPayment = () => {
    setPaymentForm({
      amount: selectedSale?.remainingPayment || 0,
      paymentMethod: "Cash",
      paidAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowPayment(true);
  };

  const handleAddPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    setRecordingPayment(true);
    try {
      await packageSaleService.addPayment(selectedSale.id, {
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        paidAt: paymentForm.paidAt ? new Date(paymentForm.paidAt).toISOString() : undefined,
        notes: paymentForm.notes || undefined,
      });
      toast.success(language === "tr" ? "Odeme kaydedildi" : "Payment recorded");
      setShowPayment(false);
      const res = await packageSaleService.getById(selectedSale.id);
      if (res.data.success && res.data.data) setSelectedSale(res.data.data);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Islem basarisiz" : "Operation failed");
    } finally {
      setRecordingPayment(false);
    }
  };

  /* Customer/treatment dropdown filtering */
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return `${c.name} ${c.surname}`.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });

  const filteredTreatments = treatments.filter((tr) => {
    if (!treatmentSearch) return true;
    return tr.name.toLowerCase().includes(treatmentSearch.toLowerCase());
  });

  const paymentMethods = [
    { value: "Cash", label: t.cash },
    { value: "CreditCard", label: t.creditCard },
    { value: "BankTransfer", label: t.bankTransfer },
    { value: "Check", label: t.check },
    { value: "Other", label: t.other },
  ];

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-5 text-white">

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{sales.length} {t.total}</p>
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
                { header: isTr ? "Toplam Seans" : "Total Sessions", key: "totalSessions", format: "number" },
                { header: isTr ? "Kullanılan" : "Used", key: "usedSessions", format: "number" },
                { header: isTr ? "Kalan" : "Remaining", key: "remainingSessions", format: "number" },
                { header: isTr ? "Toplam Fiyat" : "Total Price", key: "totalPrice", format: "currency" },
                { header: isTr ? "Ödenen" : "Paid", key: "paidAmount", format: "currency" },
                { header: isTr ? "Kalan Ödeme" : "Remaining Payment", key: "remainingPayment", format: "currency" },
                { header: isTr ? "Durum" : "Status", key: "statusDisplay" },
                { header: isTr ? "Başlangıç" : "Start Date", key: "startDate", format: "date" },
                { header: isTr ? "Bitiş" : "End Date", key: "endDate", format: "date" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Paket_Satislari" : "Package_Sales"}
            pdfTitle={language === "tr" ? "Paket Satış Listesi" : "Package Sales List"}
          />
          <button
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newSale}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t.totalSales}
          value={String(stats.totalSales)}
          icon={<svg className="text-purple-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>}
          gradient="bg-purple-500"
        />
        <StatCard
          label={t.totalRevenue}
          value={`${fmt(stats.totalRevenue)} TL`}
          icon={<svg className="text-emerald-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          gradient="bg-emerald-500"
        />
        <StatCard
          label={t.activePackages}
          value={String(stats.activePackages)}
          icon={<svg className="text-blue-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          gradient="bg-blue-500"
        />
        <StatCard
          label={t.completedPackages}
          value={String(stats.completedPackages)}
          icon={<svg className="text-pink-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          gradient="bg-pink-500"
        />
      </div>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
          />
        </div>

        {/* Date filter */}
        <select
          value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="all" className="bg-[#1a1a2e]">{t.allTime}</option>
          <option value="this-month" className="bg-[#1a1a2e]">{t.thisMonth}</option>
          <option value="last-month" className="bg-[#1a1a2e]">{t.lastMonth}</option>
          <option value="last-3-months" className="bg-[#1a1a2e]">{t.last3Months}</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter ?? ""} onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#1a1a2e]">{t.allStatuses}</option>
          <option value="1" className="bg-[#1a1a2e]">{t.active}</option>
          <option value="2" className="bg-[#1a1a2e]">{t.completed}</option>
          <option value="3" className="bg-[#1a1a2e]">{t.expired}</option>
          <option value="4" className="bg-[#1a1a2e]">{t.cancelled}</option>
        </select>

        {/* Treatment filter */}
        <select
          value={treatmentFilter ?? ""} onChange={(e) => setTreatmentFilter(e.target.value ? Number(e.target.value) : null)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer max-w-[200px]"
        >
          <option value="" className="bg-[#1a1a2e]">{t.allTreatments}</option>
          {treatments.map((tr) => (
            <option key={tr.id} value={tr.id} className="bg-[#1a1a2e]">{tr.name}</option>
          ))}
        </select>
      </div>

      {/* ─── TABLE ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            <p className="text-sm font-medium text-white/40">{search || statusFilter || treatmentFilter ? t.noResult : t.noData}</p>
            {!search && !statusFilter && !treatmentFilter && <p className="text-xs text-white/25">{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_auto] gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              <span>{t.customer}</span>
              <span>{t.treatment}</span>
              <span>{t.sessions}</span>
              <span>{t.progress}</span>
              <span>{t.totalPrice}</span>
              <span>{t.paidAmount}</span>
              <span>{t.remainingPayment}</span>
              <span>{t.status}</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((sale) => {
                const sc = statusColor(sale.statusValue);
                return (
                  <div
                    key={sale.id}
                    onClick={() => openDetail(sale)}
                    className="group grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_auto] gap-2 items-center px-4 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                  >
                    {/* Customer */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-[11px] font-bold text-white/70">
                        {sale.customerFullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{sale.customerFullName}</p>
                        <p className="text-[10px] text-white/30 lg:hidden">{sale.treatmentName}</p>
                      </div>
                    </div>

                    {/* Treatment */}
                    <div className="hidden lg:block">
                      <p className="text-sm text-white/80 truncate">{sale.treatmentName}</p>
                      <p className="text-[10px] text-white/30">{fmtDate(sale.startDate)}</p>
                    </div>

                    {/* Sessions */}
                    <div className="hidden lg:block">
                      <span className="text-sm font-medium text-white">
                        {sale.usedSessions}{t.of}{sale.totalSessions}
                      </span>
                      <span className="ml-1 text-[10px] text-white/30">{t.session}</span>
                    </div>

                    {/* Progress */}
                    <div className="hidden lg:block">
                      <ProgressBar used={sale.usedSessions} total={sale.totalSessions} />
                    </div>

                    {/* Price */}
                    <p className="hidden lg:block text-sm font-bold text-white">{fmt(sale.totalPrice)} TL</p>

                    {/* Paid */}
                    <p className="hidden lg:block text-sm text-emerald-400">{fmt(sale.paidAmount)} TL</p>

                    {/* Remaining */}
                    <p className={`hidden lg:block text-sm font-medium ${sale.remainingPayment > 0 ? "text-amber-400" : "text-white/40"}`}>
                      {sale.remainingPayment > 0 ? `${fmt(sale.remainingPayment)} TL` : "-"}
                    </p>

                    {/* Status */}
                    <div className="hidden lg:block">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                        {sale.statusDisplay}
                      </span>
                    </div>

                    {/* Mobile info */}
                    <div className="flex items-center justify-between lg:hidden">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{fmt(sale.totalPrice)} TL</span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sale.statusDisplay}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{sale.usedSessions}/{sale.totalSessions} {t.session}</span>
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetail(sale)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white"
                        title={t.edit}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              pageNumber={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-white/40">
              <span>{filtered.length} {t.total}</span>
              <span>{t.totalPrice}: {fmt(filtered.reduce((s, x) => s + x.totalPrice, 0))} TL</span>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
         CREATE MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t.createTitle} maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">

          {/* Customer selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.selectCustomer}</label>
            <input
              type="text" value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
            />
            {(customerSearch || createForm.customerId === 0) && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                {filteredCustomers.slice(0, 8).map((c) => (
                  <button
                    key={c.id} type="button"
                    onClick={() => { setCreateForm({ ...createForm, customerId: c.id }); setCustomerSearch(`${c.name} ${c.surname}`); }}
                    className={`w-full text-left px-3 py-2 text-sm transition hover:bg-white/10 ${createForm.customerId === c.id ? "bg-white/10 text-white" : "text-white/60"}`}
                  >
                    {c.name} {c.surname} {c.phone && <span className="text-white/30 text-xs ml-2">{c.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Treatment selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.selectTreatment}</label>
            <input
              type="text" value={treatmentSearch}
              onChange={(e) => setTreatmentSearch(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
            />
            {(treatmentSearch || createForm.treatmentId === 0) && (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                {filteredTreatments.slice(0, 8).map((tr) => (
                  <button
                    key={tr.id} type="button"
                    onClick={() => { setCreateForm({ ...createForm, treatmentId: tr.id }); setTreatmentSearch(tr.name); }}
                    className={`w-full text-left px-3 py-2 text-sm transition hover:bg-white/10 ${createForm.treatmentId === tr.id ? "bg-white/10 text-white" : "text-white/60"}`}
                  >
                    {tr.name} <span className="text-white/30 text-xs ml-2">{fmt(tr.price ?? 0)} TL</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sessions + Price row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.sessionCount}</label>
              <input
                type="number" min={1} value={createForm.totalSessions}
                onChange={(e) => setCreateForm({ ...createForm, totalSessions: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.packagePrice}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">TL</span>
                <input
                  type="number" min={0} step={0.01} value={createForm.totalPrice || ""}
                  onChange={(e) => setCreateForm({ ...createForm, totalPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-white/25"
                />
              </div>
            </div>
          </div>

          {/* Payment row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentAmount}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">TL</span>
                <input
                  type="number" min={0} step={0.01} value={createForm.paidAmount || ""}
                  onChange={(e) => setCreateForm({ ...createForm, paidAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-white/25"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentMethod}</label>
              <select
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none appearance-none"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value} className="bg-[#1a1a2e]">{pm.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.startDate}</label>
              <input
                type="date" value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.endDate}</label>
              <input
                type="date" value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.notes}</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button" onClick={() => setShowCreate(false)}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════
         DETAIL MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={t.detailTitle} maxWidth="max-w-2xl">
        {selectedSale && (() => {
          const sale = selectedSale;
          const sc = statusColor(sale.statusValue);
          return (
            <div className="space-y-5">

              {/* Hero */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-lg font-bold text-white/70">
                    {sale.customerFullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{sale.customerFullName}</p>
                    <p className="text-xs text-white/40">{sale.treatmentName}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                  {sale.statusDisplay}
                </span>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.sessions}</p>
                  <p className="mt-1 text-xl font-bold text-white">{sale.usedSessions}{t.of}{sale.totalSessions}</p>
                  <ProgressBar used={sale.usedSessions} total={sale.totalSessions} />
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.totalPrice}</p>
                  <p className="mt-1 text-xl font-bold text-white">{fmt(sale.totalPrice)} TL</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.paidAmount}</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">{fmt(sale.paidAmount)} TL</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.remainingPayment}</p>
                  <p className={`mt-1 text-xl font-bold ${sale.remainingPayment > 0 ? "text-amber-400" : "text-white/40"}`}>
                    {sale.remainingPayment > 0 ? `${fmt(sale.remainingPayment)} TL` : "-"}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-white/40">
                <span>{t.seller}: <span className="text-white/60">{sale.staffFullName}</span></span>
                <span>{t.validUntil}: <span className="text-white/60">{fmtDate(sale.endDate)}</span></span>
                <span>{t.createdAt}: <span className="text-white/60">{fmtDate(sale.createdAt)}</span></span>
              </div>
              {sale.notes && <p className="text-xs text-white/40 italic">{sale.notes}</p>}

              {/* Usage History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white/70">{t.usageHistory}</h3>
                  {sale.statusValue === 1 && sale.remainingSessions > 0 && (
                    <button onClick={openUsage} className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition">
                      + {t.recordUsage}
                    </button>
                  )}
                </div>
                {sale.usages && sale.usages.length > 0 ? (
                  <div className="space-y-1.5">
                    {sale.usages.map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">
                            {sale.usages!.length - i}
                          </span>
                          <span className="text-xs text-white/60">{fmtDate(u.usageDate)}</span>
                          {u.staffFullName && <span className="text-[10px] text-white/30">- {u.staffFullName}</span>}
                        </div>
                        {u.notes && <span className="text-[10px] text-white/30 truncate max-w-[150px]">{u.notes}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic">{t.noUsage}</p>
                )}
              </div>

              {/* Payment History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white/70">{t.paymentHistory}</h3>
                  {sale.remainingPayment > 0 && (
                    <button onClick={openPayment} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
                      + {t.addPayment}
                    </button>
                  )}
                </div>
                {sale.payments && sale.payments.length > 0 ? (
                  <div className="space-y-1.5">
                    {sale.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">{fmt(p.amount)} TL</span>
                          <span className="text-[10px] text-white/30">{p.paymentMethodDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">{fmtDate(p.paidAt)}</span>
                          {p.notes && <span className="text-[10px] text-white/30 truncate max-w-[100px]">{p.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic">{t.noPayments}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {sale.statusValue === 1 && sale.remainingSessions > 0 && (
                  <button
                    onClick={openUsage}
                    className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    {t.recordUsage}
                  </button>
                )}
                {sale.remainingPayment > 0 && (
                  <button
                    onClick={openPayment}
                    className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    {t.addPayment}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(sale.id)}
                  className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 transition hover:bg-red-500/20"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ═══════════════════════════════════════════
         USAGE MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showUsage} onClose={() => setShowUsage(false)} title={t.usageTitle} maxWidth="max-w-md">
        <form onSubmit={handleRecordUsage} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.usageDate}</label>
            <input
              type="date" value={usageForm.usageDate}
              onChange={(e) => setUsageForm({ ...usageForm, usageDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.usageStaff}</label>
            <select
              value={usageForm.staffId}
              onChange={(e) => setUsageForm({ ...usageForm, staffId: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none appearance-none"
            >
              <option value={0} className="bg-[#1a1a2e]">{t.selectStaff}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name} {s.surname}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.usageNotes}</label>
            <textarea
              value={usageForm.notes}
              onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={recordingUsage}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {recordingUsage ? t.recording : t.record}
            </button>
            <button
              type="button" onClick={() => setShowUsage(false)}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════
         PAYMENT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title={t.paymentTitle} maxWidth="max-w-md">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentAmountLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">TL</span>
              <input
                type="number" min={0.01} step={0.01} value={paymentForm.amount || ""}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentMethod}</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none appearance-none"
            >
              {paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value} className="bg-[#1a1a2e]">{pm.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.paymentDate}</label>
            <input
              type="date" value={paymentForm.paidAt}
              onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.notes}</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={recordingPayment}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {recordingPayment ? t.saving : t.save}
            </button>
            <button
              type="button" onClick={() => setShowPayment(false)}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

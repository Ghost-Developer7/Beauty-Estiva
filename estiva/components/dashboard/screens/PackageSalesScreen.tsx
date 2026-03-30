"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { packageSaleService } from "@/services/packageSaleService";
import { customerService } from "@/services/customerService";
import { treatmentService } from "@/services/treatmentService";
import { staffService } from "@/services/staffService";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
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
    newSale: "New Package",
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
    title: "Paket Satışları",
    total: "toplam",
    newSale: "Yeni Paket",
    search: "Müşteri, hizmet ara...",
    loading: "Yükleniyor...",
    noData: "Henüz paket satışı yok.",
    noDataSub: "Müşterilerinize hizmet paketleri satmaya başlayın.",
    noResult: "Filtrenizle eşleşen sonuç yok.",
    totalSales: "Toplam Satış",
    totalRevenue: "Toplam Gelir",
    activePackages: "Aktif Paketler",
    completedPackages: "Tamamlanan",
    allStatuses: "Tüm Durumlar",
    active: "Aktif",
    completed: "Tamamlandı",
    expired: "Süresi Doldu",
    cancelled: "İptal",
    allTreatments: "Tüm Hizmetler",
    thisMonth: "Bu Ay",
    lastMonth: "Geçen Ay",
    last3Months: "Son 3 Ay",
    allTime: "Tüm Zamanlar",
    saleDate: "Satış Tarihi",
    customer: "Müşteri",
    treatment: "Hizmet",
    sessions: "Seanslar",
    progress: "İlerleme",
    totalPrice: "Toplam",
    paidAmount: "Ödenen",
    remainingPayment: "Kalan",
    status: "Durum",
    actions: "İşlemler",
    used: "kullanıldı",
    remaining: "kalan",
    createTitle: "Yeni Paket Satışı",
    editTitle: "Paket Düzenle",
    selectCustomer: "Müşteri Seçin",
    selectTreatment: "Hizmet Seçin",
    sessionCount: "Seans Sayısı",
    packagePrice: "Paket Fiyatı",
    paymentAmount: "Ödeme Tutarı",
    paymentMethod: "Ödeme Yöntemi",
    cash: "Nakit",
    creditCard: "Kredi / Banka Kartı",
    bankTransfer: "Havale / EFT",
    check: "Çek",
    other: "Diğer",
    startDate: "Başlangıç Tarihi",
    endDate: "Bitiş Tarihi (Geçerlilik)",
    notes: "Notlar",
    notesPlaceholder: "İsteğe bağlı notlar...",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    detailTitle: "Paket Detayı",
    packageInfo: "Paket Bilgisi",
    usageHistory: "Kullanım Geçmişi",
    paymentHistory: "Ödeme Geçmişi",
    recordUsage: "Seans Kullanımı Kaydet",
    addPayment: "Ödeme Ekle",
    noUsage: "Henüz seans kullanılmadı.",
    noPayments: "Ödeme kaydı yok.",
    edit: "Düzenle",
    delete: "Sil",
    confirmDelete: "Bu paket satışını silmek istediğinize emin misiniz?",
    session: "Seans",
    of: "/",
    validUntil: "Geçerlilik",
    seller: "Satıcı",
    createdAt: "Oluşturulma",
    usageTitle: "Seans Kullanımı Kaydet",
    usageDate: "Seans Tarihi",
    usageStaff: "Personel (isteğe bağlı)",
    selectStaff: "Personel Seçin",
    usageNotes: "Notlar",
    record: "Kaydet",
    recording: "Kaydediliyor...",
    paymentTitle: "Ödeme Ekle",
    paymentAmountLabel: "Tutar",
    paymentDate: "Ödeme Tarihi",
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDate = (d: string, lang: "en" | "tr" = "tr") => {
  try {
    return new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
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
    default: return { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/30" };
  }
};

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, sub, icon, gradient, isDark }: { label: string; value: string; sub?: string; icon: React.ReactNode; gradient: string; isDark: boolean }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 transition-all duration-300 ${isDark ? "hover:border-white/[0.15]" : "hover:border-gray-300"} ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-gray-50"} hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/5`}>
      {/* Animated background glow */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:h-32 group-hover:w-32 ${gradient}`} />
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${gradient} bg-opacity-20 transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-[11px] font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
          <p className={`mt-0.5 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
          {sub && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ used, total, isDark }: { used: number; total: number; isDark: boolean }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isComplete = used >= total;
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 flex-1 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"} tabular-nums`}>{Math.round(pct)}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function PackageSalesScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const [showCustomerDd, setShowCustomerDd] = useState(false);
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [showTreatmentDd, setShowTreatmentDd] = useState(false);

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
        toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, treatmentFilter, page, pageSize, language]);

  const fetchReferenceData = useCallback(async () => {
    const [custRes, treatRes, staffRes] = await Promise.allSettled([
      customerService.list(),
      treatmentService.list(),
      staffService.list(),
    ]);
    if (custRes.status === "fulfilled" && custRes.value.data.success && custRes.value.data.data) setCustomers(custRes.value.data.data);
    if (treatRes.status === "fulfilled" && treatRes.value.data.success && treatRes.value.data.data) setTreatments(treatRes.value.data.data);
    if (staffRes.status === "fulfilled" && staffRes.value.data.success && staffRes.value.data.data) setStaffList(staffRes.value.data.data);
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
    setShowCustomerDd(false);
    setTreatmentSearch("");
    setShowTreatmentDd(false);
    setShowCreate(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.customerId || !createForm.treatmentId) {
      toast.error(language === "tr" ? "Müşteri ve hizmet seçimi zorunludur" : "Customer and treatment are required");
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
      toast.success(language === "tr" ? "Paket satışı oluşturuldu" : "Package sale created");
      setShowCreate(false);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
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
      toast.success(language === "tr" ? "Paket satışı silindi" : "Package sale deleted");
      setShowDetail(false);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
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
      toast.success(language === "tr" ? "Seans kullanımı kaydedildi" : "Session usage recorded");
      setShowUsage(false);
      // Refresh detail
      const res = await packageSaleService.getById(selectedSale.id);
      if (res.data.success && res.data.data) setSelectedSale(res.data.data);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "tr" ? "İşlem başarısız" : "Operation failed");
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
      toast.success(language === "tr" ? "Ödeme kaydedildi" : "Payment recorded");
      setShowPayment(false);
      const res = await packageSaleService.getById(selectedSale.id);
      if (res.data.success && res.data.data) setSelectedSale(res.data.data);
      fetchData();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
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
    { value: "Cash", label: t.cash, aliases: ["nakit", "cash"] },
    { value: "CreditCard", label: t.creditCard, aliases: ["kredi", "credit", "kart", "card", "banka"] },
    { value: "BankTransfer", label: t.bankTransfer, aliases: ["havale", "eft", "bank", "transfer"] },
    { value: "Check", label: t.check, aliases: ["çek", "check"] },
    { value: "Other", label: t.other, aliases: ["diğer", "other"] },
  ];

  const translateMethod = (display: string): string => {
    if (!display) return display;
    const lower = display.toLowerCase();
    const found = paymentMethods.find(pm =>
      pm.value.toLowerCase() === lower ||
      pm.aliases.some(a => lower.includes(a))
    );
    return found ? found.label : display;
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{loading ? <span className={`inline-block h-4 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${sales.length} ${t.total}`}</p>
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
            filenamePrefix={language === "tr" ? "Paket_Satışları" : "Package_Sales"}
            pdfTitle={language === "tr" ? "Paket Satış Listesi" : "Package Sales List"}
          />
          <button
            onClick={openCreate}
            className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newSale}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-3 space-y-2`}>
                <div className={`h-3 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-6 w-24 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              label={t.totalSales}
              value={String(stats.totalSales)}
              icon={<svg className="text-purple-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>}
              gradient="bg-purple-500"
              isDark={isDark}
            />
            <StatCard
              label={t.totalRevenue}
              value={`${fmt(stats.totalRevenue)} ₺`}
              icon={<svg className="text-emerald-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
              gradient="bg-emerald-500"
              isDark={isDark}
            />
            <StatCard
              label={t.activePackages}
              value={String(stats.activePackages)}
              icon={<svg className="text-blue-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              gradient="bg-blue-500"
              isDark={isDark}
            />
            <StatCard
              label={t.completedPackages}
              value={String(stats.completedPackages)}
              icon={<svg className="text-pink-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              gradient="bg-pink-500"
              isDark={isDark}
            />
          </>
        )}
      </div>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className={`w-full rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-2 pl-11 pr-4 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/20" : "focus:border-gray-400"} transition`}
          />
        </div>

        {/* Date filter */}
        <select
          value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className={`rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none cursor-pointer`}
        >
          <option value="all" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allTime}</option>
          <option value="this-month" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.thisMonth}</option>
          <option value="last-month" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.lastMonth}</option>
          <option value="last-3-months" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.last3Months}</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter ?? ""} onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
          className={`rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none cursor-pointer`}
        >
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allStatuses}</option>
          <option value="1" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.active}</option>
          <option value="2" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.completed}</option>
          <option value="3" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.expired}</option>
          <option value="4" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.cancelled}</option>
        </select>

        {/* Treatment filter */}
        <select
          value={treatmentFilter ?? ""} onChange={(e) => setTreatmentFilter(e.target.value ? Number(e.target.value) : null)}
          className={`rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-2 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none cursor-pointer max-w-[200px]`}
        >
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allTreatments}</option>
          {treatments.map((tr) => (
            <option key={tr.id} value={tr.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{tr.name}</option>
          ))}
        </select>
      </div>

      {/* ─── TABLE ─── */}
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} ${isDark ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "shadow-sm"}`}>
        {loading ? (
          <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-300 border-t-gray-600"}`} />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className={`${isDark ? "text-white/20" : "text-gray-300"}`} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{search || statusFilter || treatmentFilter ? t.noResult : t.noData}</p>
            {!search && !statusFilter && !treatmentFilter && <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className={`hidden lg:grid grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_auto] gap-2 border-b ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>
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
            <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
              {filtered.map((sale) => {
                const sc = statusColor(sale.statusValue);
                return (
                  <div
                    key={sale.id}
                    onClick={() => openDetail(sale)}
                    className={`group grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_auto] gap-2 items-center px-4 py-3.5 transition-all duration-150 ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"} cursor-pointer`}
                  >
                    {/* Customer */}
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-[11px] font-bold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                        {sale.customerFullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{sale.customerFullName}</p>
                        <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"} lg:hidden`}>{sale.treatmentName}</p>
                      </div>
                    </div>

                    {/* Treatment */}
                    <div className="hidden lg:block">
                      <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-800"} truncate`}>{sale.treatmentName}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{fmtDate(sale.startDate, language)}</p>
                    </div>

                    {/* Sessions */}
                    <div className="hidden lg:block">
                      <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {sale.usedSessions}{t.of}{sale.totalSessions}
                      </span>
                      <span className={`ml-1 text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.session}</span>
                    </div>

                    {/* Progress */}
                    <div className="hidden lg:block">
                      <ProgressBar used={sale.usedSessions} total={sale.totalSessions} isDark={isDark} />
                    </div>

                    {/* Price */}
                    <p className={`hidden lg:block text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(sale.totalPrice)} ₺</p>

                    {/* Paid */}
                    <p className="hidden lg:block text-sm text-emerald-400">{fmt(sale.paidAmount)} ₺</p>

                    {/* Remaining */}
                    <p className={`hidden lg:block text-sm font-medium ${sale.remainingPayment > 0 ? "text-amber-400" : isDark ? "text-white/40" : "text-gray-400"}`}>
                      {sale.remainingPayment > 0 ? `${fmt(sale.remainingPayment)} ₺` : "-"}
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
                        <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(sale.totalPrice)} ₺</span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sale.statusDisplay}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{sale.usedSessions}/{sale.totalSessions} {t.session}</span>
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetail(sale)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
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
            <div className={`flex items-center justify-between border-t ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-2 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <span>{loading ? <span className={`inline-block h-3 w-12 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${filtered.length} ${t.total}`}</span>
              <span>{t.totalPrice}: {fmt(filtered.reduce((s, x) => s + x.totalPrice, 0))} ₺</span>
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
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.selectCustomer}</label>
            <div className="relative">
              <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text" value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDd(true); }}
                onFocus={() => setShowCustomerDd(true)}
                placeholder={t.search}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
              {showCustomerDd && (
                <div className={`absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]" : "bg-white"} shadow-xl`}>
                  {filteredCustomers.length === 0 ? (
                    <div className={`px-4 py-3 text-xs ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Müşteri bulunamadı" : "No customers found"}</div>
                  ) : (
                    filteredCustomers.slice(0, 10).map((c) => (
                      <button
                        key={c.id} type="button"
                        onClick={() => { setCreateForm({ ...createForm, customerId: c.id }); setCustomerSearch(`${c.name} ${c.surname}`); setShowCustomerDd(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${createForm.customerId === c.id ? (isDark ? "bg-white/5" : "bg-gray-100") : ""}`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-[10px] font-bold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                          {c.name[0]}{c.surname[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"} truncate`}>{c.name} {c.surname}</p>
                          {c.phone && <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{c.phone}</p>}
                        </div>
                        {createForm.customerId === c.id && (
                          <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Treatment selection */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.selectTreatment}</label>
            <div className="relative">
              <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text" value={treatmentSearch}
                onChange={(e) => { setTreatmentSearch(e.target.value); setShowTreatmentDd(true); }}
                onFocus={() => setShowTreatmentDd(true)}
                placeholder={t.search}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
              {showTreatmentDd && (
                <div className={`absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]" : "bg-white"} shadow-xl`}>
                  {filteredTreatments.length === 0 ? (
                    <div className={`px-4 py-3 text-xs ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Hizmet bulunamadı" : "No treatments found"}</div>
                  ) : (
                    filteredTreatments.slice(0, 10).map((tr) => (
                      <button
                        key={tr.id} type="button"
                        onClick={() => { setCreateForm({ ...createForm, treatmentId: tr.id }); setTreatmentSearch(tr.name); setShowTreatmentDd(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${createForm.treatmentId === tr.id ? (isDark ? "bg-white/5" : "bg-gray-100") : ""}`}
                      >
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tr.color || "#a78bfa" }} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"} truncate`}>{tr.name}</p>
                          <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{tr.durationMinutes} {language === "tr" ? "dk" : "min"} • ₺{fmt(tr.price ?? 0)}</p>
                        </div>
                        {createForm.treatmentId === tr.id && (
                          <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sessions + Price row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.sessionCount}</label>
              <input
                type="number" min={1} value={createForm.totalSessions}
                onChange={(e) => setCreateForm({ ...createForm, totalSessions: Number(e.target.value) })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.packagePrice}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-gray-300"}`}>₺</span>
                <input
                  type="number" min={0} step={0.01} value={createForm.totalPrice || ""}
                  onChange={(e) => setCreateForm({ ...createForm, totalPrice: Number(e.target.value) })}
                  className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
                />
              </div>
            </div>
          </div>

          {/* Payment row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentAmount}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-gray-300"}`}>₺</span>
                <input
                  type="number" min={0} step={0.01} value={createForm.paidAmount || ""}
                  onChange={(e) => setCreateForm({ ...createForm, paidAmount: Number(e.target.value) })}
                  className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentMethod}</label>
              <select
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none`}
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{pm.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.startDate}</label>
              <LocaleDateInput
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} ${isDark ? "[color-scheme:dark]" : ""}`}
                isDark={isDark}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.endDate}</label>
              <LocaleDateInput
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} ${isDark ? "[color-scheme:dark]" : ""}`}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50`}
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button" onClick={() => setShowCreate(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
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
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-lg font-bold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                    {sale.customerFullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{sale.customerFullName}</p>
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{sale.treatmentName}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                  {sale.statusDisplay}
                </span>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.sessions}</p>
                  <p className={`mt-1 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{sale.usedSessions}{t.of}{sale.totalSessions}</p>
                  <ProgressBar used={sale.usedSessions} total={sale.totalSessions} isDark={isDark} />
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.totalPrice}</p>
                  <p className={`mt-1 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(sale.totalPrice)} ₺</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.paidAmount}</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">{fmt(sale.paidAmount)} ₺</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.remainingPayment}</p>
                  <p className={`mt-1 text-xl font-bold ${sale.remainingPayment > 0 ? "text-amber-400" : isDark ? "text-white/40" : "text-gray-400"}`}>
                    {sale.remainingPayment > 0 ? `${fmt(sale.remainingPayment)} ₺` : "-"}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className={`flex flex-wrap gap-4 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                <span>{t.seller}: <span className={`${isDark ? "text-white/60" : "text-gray-600"}`}>{sale.staffFullName}</span></span>
                <span>{t.validUntil}: <span className={`${isDark ? "text-white/60" : "text-gray-600"}`}>{fmtDate(sale.endDate, language)}</span></span>
                <span>{t.createdAt}: <span className={`${isDark ? "text-white/60" : "text-gray-600"}`}>{fmtDate(sale.createdAt, language)}</span></span>
              </div>
              {sale.notes && <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"} italic`}>{sale.notes}</p>}

              {/* Usage History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>{t.usageHistory}</h3>
                  {sale.statusValue === 1 && sale.remainingSessions > 0 && (
                    <button onClick={openUsage} className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition">
                      + {t.recordUsage}
                    </button>
                  )}
                </div>
                {sale.usages && sale.usages.length > 0 ? (
                  <div className="space-y-1.5">
                    {sale.usages.map((u, i) => (
                      <div key={u.id} className={`flex items-center justify-between rounded-lg border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-3 py-2`}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">
                            {sale.usages!.length - i}
                          </span>
                          <span className={`text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>{fmtDate(u.usageDate, language)}</span>
                          {u.staffFullName && <span className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>- {u.staffFullName}</span>}
                        </div>
                        {u.notes && <span className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"} truncate max-w-[150px]`}>{u.notes}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-300"} italic`}>{t.noUsage}</p>
                )}
              </div>

              {/* Payment History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>{t.paymentHistory}</h3>
                  {sale.remainingPayment > 0 && (
                    <button onClick={openPayment} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
                      + {t.addPayment}
                    </button>
                  )}
                </div>
                {sale.payments && sale.payments.length > 0 ? (
                  <div className="space-y-1.5">
                    {sale.payments.map((p) => (
                      <div key={p.id} className={`flex items-center justify-between rounded-lg border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-3 py-2`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">{fmt(p.amount)} ₺</span>
                          <span className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{translateMethod(p.paymentMethodDisplay)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{fmtDate(p.paidAt, language)}</span>
                          {p.notes && <span className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"} truncate max-w-[100px]`}>{p.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-300"} italic`}>{t.noPayments}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {sale.statusValue === 1 && sale.remainingSessions > 0 && (
                  <button
                    onClick={openUsage}
                    className={`flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition hover:opacity-90`}
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
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.usageDate}</label>
            <LocaleDateInput
              value={usageForm.usageDate}
              onChange={(e) => setUsageForm({ ...usageForm, usageDate: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} ${isDark ? "[color-scheme:dark]" : ""}`}
              isDark={isDark}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.usageStaff}</label>
            <select
              value={usageForm.staffId}
              onChange={(e) => setUsageForm({ ...usageForm, staffId: Number(e.target.value) })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none`}
            >
              <option value={0} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.selectStaff}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{s.name} {s.surname}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.usageNotes}</label>
            <textarea
              value={usageForm.notes}
              onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={recordingUsage}
              className={`flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg transition hover:opacity-90 disabled:opacity-50`}
            >
              {recordingUsage ? t.recording : t.record}
            </button>
            <button
              type="button" onClick={() => setShowUsage(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
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
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentAmountLabel}</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-gray-300"}`}>₺</span>
              <input
                type="number" min={0.01} step={0.01} value={paymentForm.amount || ""}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentMethod}</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none appearance-none`}
            >
              {paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{pm.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentDate}</label>
            <LocaleDateInput
              value={paymentForm.paidAt}
              onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} ${isDark ? "[color-scheme:dark]" : ""}`}
              isDark={isDark}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2} placeholder={t.notesPlaceholder}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={recordingPayment}
              className={`flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg transition hover:opacity-90 disabled:opacity-50`}
            >
              {recordingPayment ? t.saving : t.save}
            </button>
            <button
              type="button" onClick={() => setShowPayment(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

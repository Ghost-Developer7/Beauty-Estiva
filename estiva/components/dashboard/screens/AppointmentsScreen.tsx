"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { appointmentService } from "@/services/appointmentService";
import { customerService } from "@/services/customerService";
import { treatmentService } from "@/services/treatmentService";
import { staffService, type StaffMember } from "@/services/staffService";
import { notificationService } from "@/services/notificationService";
import type {
  AppointmentListItem,
  AppointmentDetail,
  CustomerListItem,
  TreatmentListItem,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════ */

const STATUS_MAP: Record<string, { en: string; tr: string; color: string; bg: string; dot: string; value: number }> = {
  Scheduled: { en: "Scheduled", tr: "Planlandı", color: "text-blue-400", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400", value: 1 },
  Confirmed: { en: "Confirmed", tr: "Onaylandı", color: "text-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", value: 2 },
  Completed: { en: "Completed", tr: "Tamamlandı", color: "text-green-400", bg: "bg-green-500/10 text-green-400 border-green-500/20", dot: "bg-green-400", value: 3 },
  Cancelled: { en: "Cancelled", tr: "İptal", color: "text-red-400", bg: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400", value: 4 },
  NoShow: { en: "No Show", tr: "Gelmedi", color: "text-amber-400", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400", value: 5 },
};

// Map integer values back to status keys for sending updates to the API
const STATUS_VALUE_TO_KEY: Record<number, string> = {
  1: "Scheduled", 2: "Confirmed", 3: "Completed", 4: "Cancelled", 5: "NoShow",
};

const STAFF_COLORS = [
  "#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24",
  "#fb923c", "#f87171", "#c084fc", "#22d3ee", "#a3e635",
];

type ViewMode = "list" | "timeline";

const copy = {
  en: {
    title: "Appointments",
    newAppointment: "New Appointment",
    list: "List",
    timeline: "Timeline",
    allStaff: "All Staff",
    allTreatments: "All Treatments",
    allStatuses: "All Statuses",
    search: "Search customer...",
    loading: "Loading...",
    noData: "No appointments found.",
    noDataSub: "Create your first appointment to get started.",
    total: "total",
    // Create modal
    createTitle: "New Appointment",
    customer: "Customer",
    selectCustomer: "Search or select customer...",
    newCustomer: "New Customer",
    newCustomerName: "Name",
    newCustomerSurname: "Surname",
    newCustomerPhone: "Phone",
    treatment: "Treatment",
    selectTreatment: "Select treatment...",
    staff: "Staff",
    selectStaff: "Select staff...",
    anyStaff: "Any available staff",
    dateTime: "Date & Time",
    notes: "Notes",
    notesPlaceholder: "Optional notes...",
    recurring: "Recurring appointment",
    interval: "Repeat every",
    days: "days",
    sessions: "Total sessions",
    save: "Create Appointment",
    saving: "Creating...",
    cancel: "Cancel",
    // Detail
    detailTitle: "Appointment Details",
    customerInfo: "Customer",
    treatmentInfo: "Treatment",
    staffInfo: "Staff",
    dateInfo: "Date",
    timeInfo: "Time",
    statusInfo: "Status",
    duration: "Duration",
    price: "Price",
    min: "min",
    session: "Session",
    seriesTitle: "Series Appointments",
    updateStatus: "Update Status",
    cancelAppointment: "Cancel Appointment",
    whatsappReminder: "Send WhatsApp Reminder",
    confirmCancel: "Cancel this appointment?",
    // Timeline
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    noStaff: "No staff members found.",
    // Stats
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  tr: {
    title: "Randevular",
    newAppointment: "Yeni Randevu",
    list: "Liste",
    timeline: "Zaman Çizelgesi",
    allStaff: "Tüm Personel",
    allTreatments: "Tüm Hizmetler",
    allStatuses: "Tüm Durumlar",
    search: "Müşteri ara...",
    loading: "Yükleniyor...",
    noData: "Randevu bulunamadı.",
    noDataSub: "İlk randevunuzu oluşturarak başlayın.",
    total: "toplam",
    createTitle: "Yeni Randevu",
    customer: "Müşteri",
    selectCustomer: "Müşteri arayın veya seçin...",
    newCustomer: "Yeni Müşteri",
    newCustomerName: "Ad",
    newCustomerSurname: "Soyad",
    newCustomerPhone: "Telefon",
    treatment: "Hizmet",
    selectTreatment: "Hizmet seçin...",
    staff: "Personel",
    selectStaff: "Personel seçin...",
    anyStaff: "Uygun herhangi bir personel",
    dateTime: "Tarih & Saat",
    notes: "Notlar",
    notesPlaceholder: "İsteğe bağlı notlar...",
    recurring: "Tekrarlayan randevu",
    interval: "Her",
    days: "günde bir",
    sessions: "Toplam seans",
    save: "Randevu Oluştur",
    saving: "Oluşturuluyor...",
    cancel: "Vazgeç",
    detailTitle: "Randevu Detayı",
    customerInfo: "Müşteri",
    treatmentInfo: "Hizmet",
    staffInfo: "Personel",
    dateInfo: "Tarih",
    timeInfo: "Saat",
    statusInfo: "Durum",
    duration: "Süre",
    price: "Ücret",
    min: "dk",
    session: "Seans",
    seriesTitle: "Seri Randevular",
    updateStatus: "Durum Güncelle",
    cancelAppointment: "Randevuyu İptal Et",
    whatsappReminder: "WhatsApp Hatırlatma Gönder",
    confirmCancel: "Bu randevuyu iptal etmek istediğinize emin misiniz?",
    today: "Bugün",
    yesterday: "Dün",
    tomorrow: "Yarın",
    noStaff: "Personel bulunamadı.",
    scheduled: "Planlandı",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal",
  },
};

interface CreateForm {
  customerId: number;
  isNewCustomer: boolean;
  newCustomerName: string;
  newCustomerSurname: string;
  newCustomerPhone: string;
  staffId: number;
  treatmentId: number;
  startTime: string;
  notes: string;
  isRecurring: boolean;
  recurrenceIntervalDays: number;
  totalSessions: number;
}

const emptyForm: CreateForm = {
  customerId: 0,
  isNewCustomer: false,
  newCustomerName: "",
  newCustomerSurname: "",
  newCustomerPhone: "",
  staffId: 0,
  treatmentId: 0,
  startTime: "",
  notes: "",
  isRecurring: false,
  recurrenceIntervalDays: 7,
  totalSessions: 2,
};

/* ═══════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

const formatDateShort = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

const getStaffColor = (staffId: number) => STAFF_COLORS[staffId % STAFF_COLORS.length];

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, color, isDark }: { label: string; value: number; color: string; isDark: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-3`}>
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <div>
        <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, language, onClick }: { status: string; language: "en" | "tr"; onClick?: () => void }) {
  const s = STATUS_MAP[status] || STATUS_MAP["Scheduled"];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80 ${s.bg} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {language === "tr" ? s.tr : s.en}
    </button>
  );
}

function TreatmentChip({ name, color }: { name: string; color: string | null }) {
  const c = color || "#a78bfa";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${c}15`, color: c, border: `1px solid ${c}30` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
      {name}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function AppointmentsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];
  const searchParams = useSearchParams();

  /* ─── Data ─── */
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* ─── Filters ─── */
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const param = searchParams.get("view");
    return param === "timeline" ? "timeline" : "list";
  });
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split("T")[0]);
  const [staffFilter, setStaffFilter] = useState<number | "">("");
  const [treatmentFilter, setTreatmentFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ─── Create Modal ─── */
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  /* ─── Detail Panel ─── */
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  /* ─── Status Modal ─── */
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ id: number; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState("Scheduled");

  /* ═══ DATA FETCHING ═══ */

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = {};
      if (dateFilter) {
        params.startDate = dateFilter;
        params.endDate = dateFilter;
      }
      if (staffFilter) params.staffId = staffFilter;
      params.pageNumber = page;
      params.pageSize = pageSize;
      const res = await appointmentService.listPaginated(params as { startDate?: string; endDate?: string; staffId?: number; pageNumber?: number; pageSize?: number });
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setAppointments(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const params: Record<string, string | number> = {};
        if (dateFilter) { params.startDate = dateFilter; params.endDate = dateFilter; }
        if (staffFilter) params.staffId = staffFilter;
        const res = await appointmentService.list(params as { startDate?: string; endDate?: string; staffId?: number });
        if (res.data.success && res.data.data) {
          setAppointments(res.data.data);
          setTotalCount(res.data.data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(language === "tr" ? "Randevular yüklenemedi" : "Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, staffFilter, page, pageSize, language]);

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

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ═══ FILTERED DATA ═══ */

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (treatmentFilter !== "" && a.treatmentId !== treatmentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.customerFullName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    scheduled: appointments.filter(a => a.status === "Scheduled").length,
    confirmed: appointments.filter(a => a.status === "Confirmed").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    // Pre-fill with next nearest half hour
    const now = new Date();
    now.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
    const defaultTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setForm({ ...emptyForm, startTime: defaultTime });
    setCustomerSearch("");
    setShowCreate(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let customerId = form.customerId;

    // Create new customer if needed
    if (form.isNewCustomer) {
      if (!form.newCustomerName.trim() || !form.newCustomerSurname.trim()) {
        toast.error(language === "tr" ? "Müşteri adı ve soyadı zorunludur" : "Customer name and surname are required");
        return;
      }
      try {
        const res = await customerService.create({
          name: form.newCustomerName.trim(),
          surname: form.newCustomerSurname.trim(),
          phone: form.newCustomerPhone.trim() || undefined,
        });
        if (res.data.success && res.data.data) {
          customerId = res.data.data.id;
          // Refresh customer list
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

    if (!customerId) {
      toast.error(language === "tr" ? "Müşteri seçimi zorunludur" : "Customer is required");
      return;
    }
    if (!form.treatmentId) {
      toast.error(language === "tr" ? "Hizmet seçimi zorunludur" : "Treatment is required");
      return;
    }
    if (!form.startTime) {
      toast.error(language === "tr" ? "Tarih ve saat zorunludur" : "Date and time are required");
      return;
    }

    setSaving(true);
    try {
      await appointmentService.create({
        customerId,
        staffId: form.staffId || 0,
        treatmentId: form.treatmentId,
        startTime: form.startTime,
        notes: form.notes || undefined,
        isRecurring: form.isRecurring || undefined,
        recurrenceIntervalDays: form.isRecurring ? form.recurrenceIntervalDays : undefined,
        totalSessions: form.isRecurring ? form.totalSessions : undefined,
      });
      toast.success(language === "tr" ? "Randevu oluşturuldu" : "Appointment created");
      setShowCreate(false);
      fetchAppointments();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await appointmentService.getById(id);
      if (res.data.success && res.data.data) {
        setSelectedAppointment(res.data.data);
        setShowDetail(true);
      }
    } catch {
      toast.error(language === "tr" ? "Detay yüklenemedi" : "Failed to load details");
    }
  };

  const openStatusUpdate = (id: number, currentStatus: string) => {
    setStatusTarget({ id, current: currentStatus });
    setNewStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    try {
      const statusValue = STATUS_MAP[newStatus]?.value ?? 1;
      await appointmentService.updateStatus(statusTarget.id, { status: statusValue });
      toast.success(language === "tr" ? "Durum güncellendi" : "Status updated");
      setShowStatusModal(false);
      fetchAppointments();
      if (showDetail && selectedAppointment?.id === statusTarget.id) {
        openDetail(statusTarget.id);
      }
    } catch {
      toast.error(language === "tr" ? "Güncelleme başarısız" : "Update failed");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t.confirmCancel)) return;
    try {
      await appointmentService.cancel(id);
      toast.success(language === "tr" ? "Randevu iptal edildi" : "Appointment cancelled");
      fetchAppointments();
      if (showDetail) setShowDetail(false);
    } catch {
      toast.error(language === "tr" ? "İptal başarısız" : "Cancel failed");
    }
  };

  const sendReminder = async (id: number) => {
    try {
      const res = await notificationService.sendReminder(id);
      if (res.data.success) {
        toast.success(res.data.data?.message || (language === "tr" ? "Hatırlatma gönderildi" : "Reminder sent"));
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Gönderilemedi" : "Failed"));
      }
    } catch {
      toast.error(language === "tr" ? "Gönderilemedi" : "Failed to send");
    }
  };

  /* ═══ DATE NAVIGATION ═══ */
  const navigateDate = (delta: number) => {
    const d = new Date(dateFilter);
    d.setDate(d.getDate() + delta);
    setDateFilter(d.toISOString().split("T")[0]);
  };

  const goToday = () => setDateFilter(new Date().toISOString().split("T")[0]);
  const isToday = dateFilter === new Date().toISOString().split("T")[0];

  const getDateLabel = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    if (dateFilter === todayStr) return t.today;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateFilter === yesterday.toISOString().split("T")[0]) return t.yesterday;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateFilter === tomorrow.toISOString().split("T")[0]) return t.tomorrow;
    // Format the date for display
    const d = new Date(dateFilter + "T00:00:00");
    const locale = language === "tr" ? "tr-TR" : "en-US";
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  /* ═══ CUSTOMER SEARCH ═══ */
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return `${c.name} ${c.surname}`.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const selectCustomer = (c: CustomerListItem) => {
    setForm({ ...form, customerId: c.id, isNewCustomer: false });
    setCustomerSearch(`${c.name} ${c.surname}`);
    setShowCustomerDropdown(false);
  };

  /* ═══ TIMELINE HELPERS ═══ */
  const HOUR_START = 8;
  const HOUR_END = 22;
  const SLOT_HEIGHT = 48; // px per 30min
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  const getTimePosition = (timeStr: string) => {
    const d = new Date(timeStr);
    const totalMinutes = d.getHours() * 60 + d.getMinutes();
    const startMinutes = HOUR_START * 60;
    return ((totalMinutes - startMinutes) / 30) * SLOT_HEIGHT;
  };

  const getBlockHeight = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const durationMin = (end.getTime() - start.getTime()) / 60000;
    return Math.max((durationMin / 30) * SLOT_HEIGHT, SLOT_HEIGHT * 0.8);
  };

  // Group appointments by staff for timeline
  const staffWithAppointments = staffList
    .filter(s => s.isActive)
    .map(s => ({
      ...s,
      appointments: filtered.filter(a => a.staffId === s.id),
      color: getStaffColor(s.id),
    }));

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{filtered.length} {t.total}</p>
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
                { header: isTr ? "Tarih" : "Date", key: "startTime", format: "datetime" },
                { header: isTr ? "Süre (dk)" : "Duration (min)", key: "durationMinutes", format: "number" },
                { header: isTr ? "Durum" : "Status", key: "status" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Randevular" : "Appointments"}
            pdfTitle={language === "tr" ? "Randevu Listesi" : "Appointments List"}
          />
          <button
            onClick={openCreate}
            className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newAppointment}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.scheduled} value={stats.scheduled} color="bg-blue-400" isDark={isDark} />
        <StatCard label={t.confirmed} value={stats.confirmed} color="bg-emerald-400" isDark={isDark} />
        <StatCard label={t.completed} value={stats.completed} color="bg-green-400" isDark={isDark} />
        <StatCard label={t.cancelled} value={stats.cancelled} color="bg-red-400" isDark={isDark} />
      </div>

      {/* ─── DATE NAV + FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date navigation */}
        <div className={`flex items-center gap-1 rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-1`}>
          <button onClick={() => navigateDate(-1)} className={`rounded-lg px-2.5 py-1.5 ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} hover:text-white`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={goToday}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${isToday ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            {getDateLabel() || t.today}
          </button>
          <button onClick={() => navigateDate(1)} className={`rounded-lg px-2.5 py-1.5 ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} hover:text-white`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/20`}
        />

        <div className={`h-6 w-px ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

        {/* View toggle */}
        <div className={`flex rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-1`}>
          {(["list", "timeline"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${viewMode === mode ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              {mode === "list" ? t.list : t.timeline}
            </button>
          ))}
        </div>

        <div className={`h-6 w-px ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

        {/* Filters */}
        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value === "" ? "" : Number(e.target.value))}
          className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
        >
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allStaff}</option>
          {staffList.filter(s => s.isActive).map((s) => (
            <option key={s.id} value={s.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{s.name} {s.surname}</option>
          ))}
        </select>

        <select
          value={treatmentFilter}
          onChange={(e) => setTreatmentFilter(e.target.value === "" ? "" : Number(e.target.value))}
          className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
        >
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allTreatments}</option>
          {treatments.map((tr) => (
            <option key={tr.id} value={tr.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{tr.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
        >
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allStatuses}</option>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <option key={key} value={key} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{language === "tr" ? val.tr : val.en}</option>
          ))}
        </select>

        {viewMode === "list" && (
          <div className="relative ml-auto">
            <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-1.5 pl-11 pr-3 text-xs ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/20 w-48`}
            />
          </div>
        )}
      </div>

      {/* ─── DATE DISPLAY ─── */}
      <div className={`text-sm font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}>
        {formatDate(dateFilter + "T00:00:00")}
        {getDateLabel() && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{getDateLabel()}</span>}
      </div>

      {/* ═══ LIST VIEW ═══ */}
      {viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              {t.loading}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12">
              <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noData}</p>
              <p className="text-xs text-white/25">{t.noDataSub}</p>
            </div>
          ) : (
            <>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((apt) => {
                return (
                  <div
                    key={apt.id}
                    onClick={() => openDetail(apt.id)}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                  >
                    {/* Time column */}
                    <div className="w-20 shrink-0 text-center">
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatTime(apt.startTime)}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{formatTime(apt.endTime)}</p>
                    </div>

                    {/* Color bar */}
                    <div
                      className="h-10 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: apt.treatmentColor || "#a78bfa" }}
                    />

                    {/* Main info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                          {apt.customerFullName}
                        </p>
                        {apt.isRecurring && (
                          <span className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-400 border border-purple-500/20">
                            {t.session} {apt.sessionNumber}/{apt.totalSessions}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <TreatmentChip name={apt.treatmentName} color={apt.treatmentColor} />
                        <span className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"}`}>•</span>
                        <span className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{apt.staffFullName}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      <StatusBadge
                        status={apt.status}
                        language={language}
                        onClick={(e?: React.MouseEvent) => {
                          // Prevent opening detail
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openStatusUpdate(apt.id, apt.status)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/40" : "text-gray-400"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} hover:text-white`}
                        title={t.updateStatus}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => sendReminder(apt.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/40" : "text-gray-400"} transition hover:bg-[#25D366]/20 hover:text-[#25D366]`}
                        title={t.whatsappReminder}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/40" : "text-gray-400"} transition hover:bg-red-500/20 hover:text-red-400`}
                        title={t.cancelAppointment}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
          </>
          )}
        </div>
      )}

      {/* ═══ TIMELINE VIEW ═══ */}
      {viewMode === "timeline" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              {t.loading}
            </div>
          ) : staffWithAppointments.length === 0 ? (
            <div className={`p-12 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noStaff}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Staff header */}
                <div className="sticky top-0 z-10 flex border-b border-white/[0.06] bg-[#0d0d1a]/90 backdrop-blur-sm">
                  <div className={`w-16 shrink-0 border-r border-white/[0.06] px-2 py-3 text-[10px] font-medium ${isDark ? "text-white/30" : "text-gray-300"}`} />
                  {staffWithAppointments.map((s) => (
                    <div
                      key={s.id}
                      className="flex-1 min-w-[160px] border-r border-white/[0.04] px-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                          style={{ backgroundColor: s.color }}
                        >
                          {s.name[0]}{s.surname[0]}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{s.name} {s.surname}</p>
                          <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{s.appointments.length} {language === "tr" ? "randevu" : "appts"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                <div className="relative flex">
                  {/* Hours column */}
                  <div className="w-16 shrink-0 border-r border-white/[0.06]">
                    {hours.map((h) => (
                      <div key={h} className="relative" style={{ height: SLOT_HEIGHT * 2 }}>
                        <span className="absolute -top-2 right-2 text-[10px] font-medium text-white/25">
                          {String(h).padStart(2, "0")}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Staff columns */}
                  {staffWithAppointments.map((s) => (
                    <div key={s.id} className="relative flex-1 min-w-[160px] border-r border-white/[0.04]">
                      {/* Hour grid lines */}
                      {hours.map((h) => (
                        <div key={h} style={{ height: SLOT_HEIGHT * 2 }} className="border-b border-white/[0.03]">
                          <div className="h-1/2 border-b border-white/[0.015]" />
                        </div>
                      ))}

                      {/* Appointment blocks */}
                      {s.appointments.map((apt) => {
                        const top = getTimePosition(apt.startTime);
                        const height = getBlockHeight(apt.startTime, apt.endTime);
                        const color = apt.treatmentColor || s.color;

                        return (
                          <div
                            key={apt.id}
                            onClick={() => openDetail(apt.id)}
                            className="absolute left-1 right-1 cursor-pointer rounded-lg border px-2 py-1.5 transition-all duration-150 hover:scale-[1.02] hover:shadow-lg hover:z-10"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              backgroundColor: `${color}18`,
                              borderColor: `${color}40`,
                            }}
                          >
                            <p className="text-[10px] font-bold truncate" style={{ color }}>
                              {apt.customerFullName}
                            </p>
                            <p className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-400"} truncate`}>
                              {apt.treatmentName}
                            </p>
                            <p className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-300"}`}>
                              {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
         CREATE APPOINTMENT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t.createTitle} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.customer}</label>

            {/* Toggle: existing vs new */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isNewCustomer: false })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${!form.isNewCustomer ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
              >
                {t.selectCustomer.split("...")[0]}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isNewCustomer: true, customerId: 0 })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${form.isNewCustomer ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
              >
                + {t.newCustomer}
              </button>
            </div>

            {!form.isNewCustomer ? (
              <div className="relative" ref={customerDropdownRef}>
                <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder={t.selectCustomer}
                  className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-11 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
                />
                {showCustomerDropdown && (
                  <div className={`absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]" : "bg-white"} shadow-xl`}>
                    {filteredCustomers.length === 0 ? (
                      <div className={`px-4 py-3 text-xs ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.noData}</div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomer(c)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${form.customerId === c.id ? "bg-white/5" : ""}`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-[10px] font-bold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                            {c.name[0]}{c.surname[0]}
                          </div>
                          <div>
                            <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{c.name} {c.surname}</p>
                            {c.phone && <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{c.phone}</p>}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={form.newCustomerName}
                  onChange={(e) => setForm({ ...form, newCustomerName: e.target.value })}
                  placeholder={t.newCustomerName + " *"}
                  className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
                />
                <input
                  type="text"
                  value={form.newCustomerSurname}
                  onChange={(e) => setForm({ ...form, newCustomerSurname: e.target.value })}
                  placeholder={t.newCustomerSurname + " *"}
                  className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
                />
                <input
                  type="text"
                  value={form.newCustomerPhone}
                  onChange={(e) => setForm({ ...form, newCustomerPhone: e.target.value })}
                  placeholder={t.newCustomerPhone}
                  className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
                />
              </div>
            )}
          </div>

          {/* Treatment + Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.treatment}</label>
              <div className={`space-y-1.5 max-h-40 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-2`}>
                {treatments.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setForm({ ...form, treatmentId: tr.id })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${form.treatmentId === tr.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tr.color || "#a78bfa" }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"} truncate`}>{tr.name}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{tr.durationMinutes} {t.min}{tr.price != null ? ` • ₺${tr.price}` : ""}</p>
                    </div>
                    {form.treatmentId === tr.id && (
                      <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.staff}</label>
              <div className={`space-y-1.5 max-h-40 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-2`}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, staffId: 0 })}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${form.staffId === 0 ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"} text-[10px] ${isDark ? "text-white/50" : "text-gray-500"}`}>?</span>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.anyStaff}</p>
                </button>
                {staffList.filter(s => s.isActive).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, staffId: s.id })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${form.staffId === s.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      style={{ backgroundColor: getStaffColor(s.id) }}
                    >
                      {s.name[0]}{s.surname[0]}
                    </span>
                    <p className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{s.name} {s.surname}</p>
                    {form.staffId === s.id && (
                      <svg className="ml-auto shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date, Time, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.dateTime}</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/25`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t.notesPlaceholder}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${form.isRecurring ? "border-emerald-500 bg-emerald-500" : "border-white/20 bg-white/5"}`}>
                {form.isRecurring && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="hidden" />
              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{t.recurring}</span>
            </label>

            {form.isRecurring && (
              <div className="mt-4 flex items-center gap-3">
                <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.interval}</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.recurrenceIntervalDays}
                  onChange={(e) => setForm({ ...form, recurrenceIntervalDays: Number(e.target.value) })}
                  className={`w-20 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-2.5 py-1.5 text-center text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
                />
                <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.days}</span>
                <div className={`mx-2 h-4 w-px ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
                <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.sessions}</span>
                <input
                  type="number"
                  min={2}
                  max={52}
                  value={form.totalSessions}
                  onChange={(e) => setForm({ ...form, totalSessions: Number(e.target.value) })}
                  className={`w-20 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-2.5 py-1.5 text-center text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50`}
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} hover:text-white`}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════
         APPOINTMENT DETAIL MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={t.detailTitle} maxWidth="max-w-lg">
        {selectedAppointment && (() => {
          const apt = selectedAppointment;
          const status = STATUS_MAP[apt.status] || STATUS_MAP["Scheduled"];
          return (
            <div className="space-y-5">
              {/* Status banner */}
              <div className={`flex items-center gap-3 rounded-xl border p-3 ${status.bg}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                <span className="text-sm font-semibold">{language === "tr" ? status.tr : status.en}</span>
                {apt.isRecurring && (
                  <span className={`ml-auto rounded-md ${isDark ? "bg-white/10" : "bg-gray-100"} px-2 py-0.5 text-[10px] font-bold`}>
                    {t.session} {apt.sessionNumber}/{apt.totalSessions}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow icon="user" label={t.customerInfo} value={apt.customerFullName} isDark={isDark} />
                <DetailRow icon="tag" label={t.treatmentInfo} isDark={isDark}>
                  <TreatmentChip name={apt.treatmentName} color={apt.treatmentColor} />
                </DetailRow>
                <DetailRow icon="users" label={t.staffInfo} value={apt.staffFullName} isDark={isDark} />
                <DetailRow icon="clock" label={t.duration} value={`${apt.durationMinutes} ${t.min}`} isDark={isDark} />
                <DetailRow icon="calendar" label={t.dateInfo} value={formatDate(apt.startTime)} isDark={isDark} />
                <DetailRow icon="time" label={t.timeInfo} value={`${formatTime(apt.startTime)} - ${formatTime(apt.endTime)}`} isDark={isDark} />
                {apt.notes && (
                  <div className="col-span-2">
                    <DetailRow icon="note" label={t.notes} value={apt.notes} isDark={isDark} />
                  </div>
                )}
              </div>

              {/* Series appointments */}
              {apt.seriesAppointments && apt.seriesAppointments.length > 1 && (
                <div className="space-y-2">
                  <p className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.seriesTitle}</p>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                    {apt.seriesAppointments.map((sa) => {
                      const ss = STATUS_MAP[sa.status] || STATUS_MAP["Scheduled"];
                      return (
                        <div key={sa.id} className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs ${sa.id === apt.id ? "bg-white/10" : ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />
                          <span className={`${isDark ? "text-white/50" : "text-gray-500"}`}>{t.session} {sa.sessionNumber}</span>
                          <span className={`${isDark ? "text-white" : "text-gray-900"}`}>{formatDateShort(sa.startTime)}</span>
                          <span className={`${isDark ? "text-white/40" : "text-gray-400"}`}>{formatTime(sa.startTime)}</span>
                          <span className={`ml-auto text-[10px] ${ss.color}`}>{language === "tr" ? ss.tr : ss.en}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { openStatusUpdate(apt.id, apt.status); setShowDetail(false); }}
                  className={`flex-1 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                >
                  {t.updateStatus}
                </button>
                <button
                  onClick={() => sendReminder(apt.id)}
                  className="rounded-xl bg-[#25D366]/15 px-4 py-2.5 text-xs font-semibold text-[#25D366] border border-[#25D366]/20 transition hover:bg-[#25D366]/25"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => { handleCancel(apt.id); }}
                  className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 transition hover:bg-red-500/20"
                >
                  {t.cancelAppointment}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ═══════════════════════════════════════════
         STATUS UPDATE MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title={t.updateStatus} maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(STATUS_MAP).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setNewStatus(key)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    newStatus === key
                      ? `${val.bg} ring-1 ring-white/20`
                      : "border-white/[0.06] hover:bg-white/5"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                  <span className={`text-sm font-medium ${newStatus === key ? "" : "text-white/50"}`}>
                    {language === "tr" ? val.tr : val.en}
                  </span>
                  {newStatus === key && (
                    <svg className={`ml-auto ${isDark ? "text-white" : "text-gray-900"}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStatusUpdate}
              className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-2.5 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50`}
            >
              {t.updateStatus}
            </button>
            <button
              onClick={() => setShowStatusModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══ Detail Row Helper ═══ */
function DetailRow({ label, value, children, isDark }: { icon: string; label: string; value?: string; children?: React.ReactNode; isDark: boolean }) {
  return (
    <div className="space-y-1">
      <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{label}</p>
      {children || <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { appointmentService } from "@/services/appointmentService";
import { paymentService } from "@/services/paymentService";
import { customerService } from "@/services/customerService";
import { currencyService } from "@/services/currencyService";
import { treatmentService } from "@/services/treatmentService";
import { staffService, type StaffMember } from "@/services/staffService";
import { notificationService } from "@/services/notificationService";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import type {
  AppointmentListItem,
  AppointmentDetail,
  CustomerListItem,
  CurrencyItem,
  TreatmentListItem,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import ExportButtons from "@/components/ui/ExportButtons";
import SharedStatCard from "@/components/ui/StatCard";
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

const STAFF_COLORS = [
  "#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24",
  "#fb923c", "#f87171", "#c084fc", "#22d3ee", "#a3e635",
];

const PAYMENT_METHODS = [
  { value: "Cash", enumValue: 1, en: "Cash", tr: "Nakit" },
  { value: "CreditCard", enumValue: 2, en: "Credit Card", tr: "Kredi / Banka Kartı" },
  { value: "BankTransfer", enumValue: 3, en: "Bank Transfer", tr: "Havale / EFT" },
  { value: "Check", enumValue: 4, en: "Check", tr: "Çek" },
  { value: "Other", enumValue: 5, en: "Other", tr: "Diğer" },
] as const;

type ViewMode = "list" | "calendar";

const MONTH_NAMES: Record<string, string[]> = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
};
const CAL_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const CAL_DAY_LABELS: Record<string, Record<number, string>> = {
  en: { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" },
  tr: { 0: "Paz", 1: "Pzt", 2: "Sal", 3: "Çar", 4: "Per", 5: "Cum", 6: "Cmt" },
};

function getCalGrid(year: number, month: number): (number | null)[][] {
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

const copy = {
  en: {
    title: "Appointments",
    newAppointment: "New Appointment",
    list: "List",
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
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    // Stats
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    tipScheduled: "Appointments waiting for confirmation.",
    tipConfirmed: "Confirmed appointments ready to go.",
    tipCompleted: "Successfully completed appointments.",
    tipCancelled: "Cancelled or no-show appointments.",
    // Calendar
    calendar: "Calendar",
    monthSummary: "Monthly Summary",
    appts: "appts",
    clickDayHint: "Click a day to view its appointments",
    more: "more",
    allStaffCal: "All Staff",
    emptyHour: "No appointment in this hour",
    dailyFlow: "Daily flow",
    quickCompleteTitle: "Take Payment",
    quickCompleteSave: "Take Payment and Complete",
    amount: "Amount",
    currency: "Currency",
    paymentMethod: "Payment Method",
    quickCompleteHint: "Double-click an appointment to record payment and mark it completed.",
    quickCompleteSuccess: "Payment recorded and appointment completed",
    quickCompleteError: "Quick completion failed",
    doubleClickHint: "Double click",
    discount: "Discount",
    discountType: "Discount Type",
    discountValue: "Discount Value",
    netAmount: "Net Amount",
    baseAmount: "Base Amount",
    discountHidden: "Discount fields hidden",
    discountShortcut: "Ctrl+Y",
    discountAmount: "Amount Discount",
    discountPercent: "Percent Discount",
  },
  tr: {
    title: "Randevular",
    newAppointment: "Yeni Randevu",
    list: "Liste",
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
    scheduled: "Planlandı",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal",
    tipScheduled: "Onay bekleyen randevular.",
    tipConfirmed: "Onaylanmış, gerçekleşecek randevular.",
    tipCompleted: "Başarıyla tamamlanan randevular.",
    tipCancelled: "İptal edilen veya gelmeyenler.",
    // Calendar
    calendar: "Takvim",
    monthSummary: "Aylık Özet",
    appts: "randevu",
    clickDayHint: "Günü tıklayarak randevuları listeleyin",
    more: "daha",
    allStaffCal: "Tüm Personel",
    emptyHour: "Bu saatte randevu yok",
    dailyFlow: "Günlük akış",
    quickCompleteTitle: "Ödeme Al",
    quickCompleteSave: "Ödeme Al ve Tamamla",
    amount: "Tutar",
    currency: "Para Birimi",
    paymentMethod: "Ödeme Yöntemi",
    quickCompleteHint: "Ödeme alıp tamamlandı yapmak için randevuya çift tıklayın.",
    quickCompleteSuccess: "Ödeme kaydedildi ve randevu tamamlandı",
    quickCompleteError: "Hızlı tamamlama başarısız",
    doubleClickHint: "Çift tık",
    discount: "İndirim",
    discountType: "İndirim Türü",
    discountValue: "İndirim Değeri",
    netAmount: "Net Tutar",
    baseAmount: "Liste Tutarı",
    discountHidden: "İndirim alanları gizli",
    discountShortcut: "Ctrl+Y",
    discountAmount: "Tutar İndirimi",
    discountPercent: "Yüzde İndirimi",
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

interface QuickCompleteForm {
  appointmentId: number;
  originalAmount: number;
  amount: number;
  currencyId: number;
  paymentMethod: (typeof PAYMENT_METHODS)[number]["value"];
  discountType: "amount" | "percent";
  discountValue: number;
  notes: string;
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

const formatDate = (d: string, lang: "en" | "tr" = "tr") =>
  new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "long", year: "numeric" });

const formatDateShort = (d: string, lang: "en" | "tr" = "tr") =>
  new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "short" });

const formatTime = (d: string, lang: "en" | "tr" = "tr") =>
  new Date(d).toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" });

const getStaffColor = (staffId: number) => STAFF_COLORS[staffId % STAFF_COLORS.length];

function calculateDiscountedAmount(originalAmount: number, discountType: "amount" | "percent", discountValue: number) {
  const safeOriginal = Number.isFinite(originalAmount) ? Math.max(originalAmount, 0) : 0;
  const safeValue = Number.isFinite(discountValue) ? Math.max(discountValue, 0) : 0;
  const discountAmount =
    discountType === "percent"
      ? Math.min(safeOriginal, safeOriginal * (safeValue / 100))
      : Math.min(safeOriginal, safeValue);

  return {
    originalAmount: safeOriginal,
    discountAmount,
    netAmount: Math.max(safeOriginal - discountAmount, 0),
  };
}

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */


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

  /* ─── Data ─── */
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Filters ─── */
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Status Modal ─── */
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ id: number; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState("Scheduled");
  const [showQuickComplete, setShowQuickComplete] = useState(false);
  const [quickCompleteTarget, setQuickCompleteTarget] = useState<AppointmentListItem | null>(null);
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [quickCompleteForm, setQuickCompleteForm] = useState<QuickCompleteForm>({
    appointmentId: 0,
    originalAmount: 0,
    amount: 0,
    currencyId: 0,
    paymentMethod: "Cash",
    discountType: "amount",
    discountValue: 0,
    notes: "",
  });
  const [quickCompleting, setQuickCompleting] = useState(false);

  /* ─── Calendar ─── */
  const todayDate = new Date();
  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());
  const [calAppointments, setCalAppointments] = useState<AppointmentListItem[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calStaffIds, setCalStaffIds] = useState<Set<number> | null>(null); // null = all

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
      const res = await appointmentService.list(params as { startDate?: string; endDate?: string; staffId?: number });
      if (res.data.success && res.data.data) {
        setAppointments(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Randevular yüklenemedi" : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, staffFilter, language]);

  const fetchReferenceData = useCallback(async () => {
    const [custRes, currRes, treatRes, staffRes] = await Promise.allSettled([
      customerService.list(),
      currencyService.list(),
      treatmentService.list(),
      staffService.list(),
    ]);
    if (custRes.status === "fulfilled" && custRes.value.data.success && custRes.value.data.data) setCustomers(custRes.value.data.data);
    if (currRes.status === "fulfilled" && currRes.value.data.success && currRes.value.data.data) setCurrencies(currRes.value.data.data);
    if (treatRes.status === "fulfilled" && treatRes.value.data.success && treatRes.value.data.data) setTreatments(treatRes.value.data.data);
    if (staffRes.status === "fulfilled" && staffRes.value.data.success && staffRes.value.data.data) setStaffList(staffRes.value.data.data);
  }, []);

  const fetchCalendarData = useCallback(async () => {
    if (viewMode !== "calendar") return;
    setCalLoading(true);
    try {
      const startDate = new Date(calYear, calMonth, 1).toISOString().split("T")[0];
      const endDate = new Date(calYear, calMonth + 1, 0).toISOString().split("T")[0];
      const res = await appointmentService.list({ startDate, endDate });
      if (res.data.success && res.data.data) setCalAppointments(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Takvim yüklenemedi" : "Failed to load calendar");
    } finally {
      setCalLoading(false);
    }
  }, [viewMode, calYear, calMonth, language]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);
  useEffect(() => { fetchCalendarData(); }, [fetchCalendarData]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("appointments.showDiscountFields");
    if (saved === "true") setShowDiscountFields(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        setShowDiscountFields((prev) => {
          const next = !prev;
          window.localStorage.setItem("appointments.showDiscountFields", String(next));
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ═══ FILTERED DATA ═══ */

  const todayStr = new Date().toISOString().split("T")[0];
  const isTodayDate = dateFilter === todayStr;
  const nowDate = new Date();
  const currentHour = nowDate.getHours();
  const nowTime = nowDate.getTime();

  const filtered = appointments
    .filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (treatmentFilter !== "" && a.treatmentId !== treatmentFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.customerFullName.toLowerCase().includes(q)) return false;
      }
      if (isTodayDate && new Date(a.endTime).getTime() <= nowTime) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const groupedByHour = new Map<number, AppointmentListItem[]>();
  filtered.forEach((appointment) => {
    const hour = new Date(appointment.startTime).getHours();
    if (!groupedByHour.has(hour)) groupedByHour.set(hour, []);
    groupedByHour.get(hour)!.push(appointment);
  });
  groupedByHour.forEach((hourAppointments, hour) => {
    groupedByHour.set(
      hour,
      [...hourAppointments].sort((a, b) => {
        const startDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        if (startDiff !== 0) return startDiff;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      })
    );
  });

  const selectedStaffMember = staffFilter === "" ? null : staffList.find((staff) => staff.id === staffFilter) ?? null;
  const remainingStaffName =
    selectedStaffMember === null
      ? t.allStaff
      : `${selectedStaffMember.name} ${selectedStaffMember.surname}`;
  const timelineStartHour = isTodayDate ? currentHour : 0;
  const timelineHours = Array.from({ length: 24 - timelineStartHour }, (_, index) => timelineStartHour + index);

  const stats = {
    scheduled: filtered.filter(a => a.status === "Scheduled").length,
    confirmed: filtered.filter(a => a.status === "Confirmed").length,
    completed: filtered.filter(a => a.status === "Completed").length,
    cancelled: filtered.filter(a => a.status === "Cancelled").length,
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

  const openQuickComplete = (appointment: AppointmentListItem) => {
    const defaultCurrency = currencies.find((currency) => currency.isDefault) || currencies[0];
    const treatment = treatments.find((item) => item.id === appointment.treatmentId);
    const originalAmount = treatment?.price ?? 0;
    setQuickCompleteTarget(appointment);
    setQuickCompleteForm({
      appointmentId: appointment.id,
      originalAmount,
      amount: originalAmount,
      currencyId: defaultCurrency?.id || 0,
      paymentMethod: "Cash",
      discountType: "amount",
      discountValue: 0,
      notes: appointment.notes || "",
    });
    setShowQuickComplete(true);
  };

  const handleAppointmentClick = (appointment: AppointmentListItem) => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      openDetail(appointment.id);
      clickTimeoutRef.current = null;
    }, 220);
  };

  const handleAppointmentDoubleClick = (appointment: AppointmentListItem) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    openQuickComplete(appointment);
  };

  const updateQuickCompleteForm = (updates: Partial<QuickCompleteForm>) => {
    setQuickCompleteForm((current) => {
      const next = { ...current, ...updates };
      const pricing = calculateDiscountedAmount(next.originalAmount, next.discountType, next.discountValue);
      return {
        ...next,
        originalAmount: pricing.originalAmount,
        amount: pricing.netAmount,
      };
    });
  };

  const handleQuickComplete = async (e: FormEvent) => {
    e.preventDefault();

    if (!quickCompleteTarget) return;
    if (!quickCompleteForm.currencyId) {
      toast.error(language === "tr" ? "Para birimi seçimi zorunludur" : "Currency is required");
      return;
    }
    if (quickCompleteForm.amount <= 0) {
      toast.error(language === "tr" ? "Tutar 0'dan büyük olmalıdır" : "Amount must be greater than 0");
      return;
    }

    setQuickCompleting(true);
    try {
      const pricing = calculateDiscountedAmount(
        quickCompleteForm.originalAmount,
        quickCompleteForm.discountType,
        quickCompleteForm.discountValue
      );
      const methodEnum = PAYMENT_METHODS.find((method) => method.value === quickCompleteForm.paymentMethod)?.enumValue ?? 1;
      const discountNote =
        showDiscountFields && pricing.discountAmount > 0
          ? `${quickCompleteForm.notes ? `${quickCompleteForm.notes}\n` : ""}${language === "tr" ? "İndirim" : "Discount"}: ${
              quickCompleteForm.discountType === "percent"
                ? `%${quickCompleteForm.discountValue}`
                : `${pricing.discountAmount.toFixed(2)}`
            } | ${language === "tr" ? "Liste" : "Base"}: ${pricing.originalAmount.toFixed(2)} | ${language === "tr" ? "Net" : "Net"}: ${pricing.netAmount.toFixed(2)}`
          : quickCompleteForm.notes;
      await paymentService.create({
        appointmentId: quickCompleteForm.appointmentId,
        amount: pricing.netAmount,
        currencyId: quickCompleteForm.currencyId,
        paymentMethod: methodEnum,
        notes: discountNote || undefined,
      });
      await appointmentService.updateStatus(quickCompleteForm.appointmentId, { status: STATUS_MAP.Completed.value });
      toast.success(t.quickCompleteSuccess);
      setShowQuickComplete(false);
      setQuickCompleteTarget(null);
      fetchAppointments();
      if (showDetail && selectedAppointment?.id === quickCompleteForm.appointmentId) {
        setShowDetail(false);
      }
    } catch {
      toast.error(t.quickCompleteError);
    } finally {
      setQuickCompleting(false);
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

  /* ═══ CALENDAR DERIVED ═══ */

  const filteredCalApts =
    calStaffIds === null
      ? calAppointments
      : calAppointments.filter((a) => calStaffIds.has(a.staffId));

  const calAptsByDay = new Map<string, AppointmentListItem[]>();
  for (const apt of filteredCalApts) {
    const key = apt.startTime.slice(0, 10);
    if (!calAptsByDay.has(key)) calAptsByDay.set(key, []);
    calAptsByDay.get(key)!.push(apt);
  }

  const calMonthStats = {
    scheduled: filteredCalApts.filter((a) => a.status === "Scheduled").length,
    confirmed: filteredCalApts.filter((a) => a.status === "Confirmed").length,
    completed: filteredCalApts.filter((a) => a.status === "Completed").length,
    cancelled: filteredCalApts.filter((a) => a.status === "Cancelled" || a.status === "NoShow").length,
  };

  const calStaffBreakdown = staffList
    .filter((s) => s.isActive)
    .map((s) => ({ ...s, count: filteredCalApts.filter((a) => a.staffId === s.id).length }))
    .filter((s) => s.count > 0);

  const calGrid = getCalGrid(calYear, calMonth);

  const calPrevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const calNextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };
  const calGoToday = () => { setCalYear(todayDate.getFullYear()); setCalMonth(todayDate.getMonth()); };

  const toggleCalStaff = (staffId: number) => {
    setCalStaffIds((prev) => {
      const cur = prev === null ? new Set(staffList.filter((s) => s.isActive).map((s) => s.id)) : new Set(prev);
      if (cur.has(staffId)) { cur.delete(staffId); if (cur.size === 0) return new Set([staffId]); }
      else { cur.add(staffId); if (cur.size === staffList.filter((s) => s.isActive).length) return null; }
      return cur;
    });
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

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
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
      {(() => {
        const isCalendar = viewMode === "calendar";
        const isLoading = isCalendar ? calLoading : loading;
        const s = isCalendar ? calMonthStats : stats;
        const sub = isCalendar ? `${MONTH_NAMES[language][calMonth]} ${calYear}` : undefined;

        const total = s.scheduled + s.confirmed + s.completed + s.cancelled;
        const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

        const cards = [
          {
            label: t.scheduled, value: s.scheduled, sub, tooltip: t.tipScheduled,
            iconColor: "text-blue-400", gradient: "bg-blue-500",
            barColor: "bg-blue-400", barPct: pct(s.scheduled),
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
          {
            label: t.confirmed, value: s.confirmed, sub, tooltip: t.tipConfirmed,
            iconColor: "text-emerald-400", gradient: "bg-emerald-500",
            barColor: "bg-emerald-400", barPct: pct(s.confirmed),
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
          },
          {
            label: t.completed, value: s.completed, sub, tooltip: t.tipCompleted,
            iconColor: "text-green-400", gradient: "bg-green-500",
            barColor: "bg-green-400", barPct: pct(s.completed),
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>,
          },
          {
            label: t.cancelled, value: s.cancelled, sub, tooltip: t.tipCancelled,
            iconColor: "text-red-400", gradient: "bg-red-500",
            barColor: "bg-red-400", barPct: pct(s.cancelled),
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
          },
        ];

        return (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"} p-4 space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 shrink-0 animate-pulse rounded-xl ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-2.5 w-20 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                      <div className={`h-5 w-12 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                    </div>
                  </div>
                </div>
              ))
            ) : cards.map((c, i) => (
              <SharedStatCard key={i} label={c.label} value={c.value} sub={c.sub} tooltip={c.tooltip}
                iconColor={c.iconColor} gradient={c.gradient} barColor={c.barColor} barPct={c.barPct} icon={c.icon} />
            ))}
          </div>
        );
      })()}

      {/* ─── TOOLBAR ─── */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-gray-50/50"} px-4 py-3 overflow-visible`}>

        {/* Left: date/month navigation */}
        <div className="flex items-center gap-2">
          {viewMode === "calendar" ? (
            <>
              <button onClick={calPrevMonth} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/50 hover:bg-white/[0.07] hover:text-white" : "text-gray-500 hover:bg-gray-200"} transition`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className={`min-w-[130px] text-center text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {MONTH_NAMES[language][calMonth]} {calYear}
              </span>
              <button onClick={calNextMonth} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/50 hover:bg-white/[0.07] hover:text-white" : "text-gray-500 hover:bg-gray-200"} transition`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
              <button onClick={calGoToday} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${isDark ? "border-white/10 text-white/50 hover:bg-white/[0.07] hover:text-white" : "border-gray-300 text-gray-500 hover:bg-gray-200"}`}>
                {t.today}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateDate(-1)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/50 hover:bg-white/[0.07] hover:text-white" : "text-gray-500 hover:bg-gray-200"} transition`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button onClick={goToday} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${isToday ? (isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900") : isDark ? "text-white/60 hover:bg-white/[0.07] hover:text-white" : "text-gray-500 hover:bg-gray-200"}`}>
                {getDateLabel() || t.today}
              </button>
              <button onClick={() => navigateDate(1)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/50 hover:bg-white/[0.07] hover:text-white" : "text-gray-500 hover:bg-gray-200"} transition`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
              <LocaleDateInput value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className={`rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04] text-white" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1.5 text-xs focus:outline-none`}
                isDark={isDark} />
            </>
          )}
        </div>

        {/* Center: staff avatars — calendar mode only */}
        {viewMode === "calendar" && staffList.filter((s) => s.isActive).length > 1 && (
          <div className="flex items-center gap-1.5">
            {/* All */}
            <button
              onClick={() => setCalStaffIds(null)}
              title={t.allStaffCal}
              className={`h-8 rounded-full px-3 text-xs font-semibold border transition ${
                calStaffIds === null
                  ? isDark ? "bg-white/10 text-white border-white/20" : "bg-gray-200 text-gray-900 border-gray-300"
                  : isDark ? "text-white/40 border-white/10 hover:text-white/70 hover:bg-white/[0.05]" : "text-gray-400 border-gray-200 hover:text-gray-700"
              }`}
            >
              {t.allStaffCal}
            </button>
            {/* Per-staff avatar — expands on hover */}
            {staffList.filter((s) => s.isActive).map((s) => {
              const isSelected = calStaffIds === null || calStaffIds.has(s.id);
              const color = STAFF_COLORS[s.id % STAFF_COLORS.length];
              const count = calAppointments.filter((a) => a.staffId === s.id).length;
              return (
                <div key={s.id} className="relative shrink-0">
                  <button
                    onClick={() => toggleCalStaff(s.id)}
                    style={{ opacity: isSelected ? 1 : 0.32 }}
                    className="group/pill flex h-8 max-w-8 items-center overflow-hidden rounded-full border border-white/[0.08] transition-all duration-300 ease-in-out hover:max-w-[200px] hover:border-white/[0.18] hover:bg-white/[0.07]"
                  >
                    {/* Avatar circle */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {s.name[0]}{s.surname[0]}
                    </div>
                    {/* Name — fades in as pill expands */}
                    <span
                      className="ml-2 mr-3.5 whitespace-nowrap text-[11px] font-semibold opacity-0 transition-opacity duration-150 delay-150 group-hover/pill:opacity-100"
                      style={{ color }}
                    >
                      {s.name} {s.surname}
                    </span>
                  </button>
                  {/* Count badge — outside button so overflow-hidden doesn't clip it */}
                  {count > 0 && (
                    <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-500 px-0.5 text-[9px] font-bold text-white leading-none">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Right: filters + view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters — shown in both modes, staff only in list mode */}
          {viewMode === "list" && (
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className={`rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04] text-white/80" : "border-gray-300 bg-white text-gray-700"} px-2.5 py-1.5 text-xs focus:outline-none`}>
              <option value="">{t.allStaff}</option>
              {staffList.filter(s => s.isActive).map((s) => <option key={s.id} value={s.id}>{s.name} {s.surname}</option>)}
            </select>
          )}
          <select value={treatmentFilter} onChange={(e) => setTreatmentFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className={`rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04] text-white/80" : "border-gray-300 bg-white text-gray-700"} px-2.5 py-1.5 text-xs focus:outline-none`}>
            <option value="">{t.allTreatments}</option>
            {treatments.map((tr) => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04] text-white/80" : "border-gray-300 bg-white text-gray-700"} px-2.5 py-1.5 text-xs focus:outline-none`}>
            <option value="">{t.allStatuses}</option>
            {Object.entries(STATUS_MAP).map(([key, val]) => <option key={key} value={key}>{language === "tr" ? val.tr : val.en}</option>)}
          </select>

          {/* Search (list only) */}
          {viewMode === "list" && (
            <div className="relative">
              <svg className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search}
                className={`rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/25" : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"} py-1.5 pl-8 pr-3 text-xs w-44 focus:outline-none`} />
            </div>
          )}

          {/* Divider */}
          <div className={`h-5 w-px ${isDark ? "bg-white/10" : "bg-gray-300"}`} />

          {/* View toggle */}
          <div className={`flex rounded-lg border ${isDark ? "border-white/10 bg-white/[0.04]" : "border-gray-300 bg-white"} p-0.5`}>
            {(["list", "calendar"] as ViewMode[]).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${viewMode === mode ? (isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900") : (isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700")}`}>
                {mode === "calendar"
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>}
                {mode === "calendar" ? t.calendar : t.list}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DATE DISPLAY ─── */}
      {viewMode !== "calendar" && (
        <div className={`text-sm font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}>
          {formatDate(dateFilter + "T00:00:00", language)}
          {getDateLabel() && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{getDateLabel()}</span>}
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {viewMode === "list" && (
        <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "border-gray-200 bg-white shadow-sm"}`}>
          {loading ? (
            <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
              {t.loading}
            </div>
          ) : (
            <>
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-white/[0.06] bg-white/[0.015]" : "border-gray-100 bg-gray-50/60"}`}>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.dailyFlow}</p>
                <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{remainingStaffName}</p>
                <p className={`mt-1 text-[11px] ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.quickCompleteHint}</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                {filtered.length} {language === "tr" ? "aktif randevu" : "active appointments"}
              </span>
            </div>
            <div>
              {(() => {
                return timelineHours.map((hour) => {
                  const hourApts = groupedByHour.get(hour) || [];
                  const isCurrentHour = isTodayDate && hour === currentHour;
                  return (
                    <div
                      key={hour}
                      className={`grid grid-cols-[88px_1fr] border-t first:border-t-0 ${isDark ? "border-white/[0.05]" : "border-gray-100"}`}
                    >
                      <div className={`px-4 py-4 ${isDark ? "bg-white/[0.015]" : "bg-gray-50/70"}`}>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-bold tabular-nums ${isCurrentHour ? (isDark ? "text-emerald-300" : "text-emerald-600") : isDark ? "text-white/55" : "text-gray-500"}`}>
                            {String(hour).padStart(2, "0")}:00
                          </span>
                          {isCurrentHour && (
                            <span className="w-fit rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                              {language === "tr" ? "ŞİMDİ" : "NOW"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`min-h-[92px] px-4 py-3 ${isCurrentHour ? (isDark ? "bg-emerald-500/[0.04]" : "bg-emerald-50/70") : ""}`}>
                        {hourApts.length === 0 ? (
                          <div className={`flex h-full min-h-[68px] items-center rounded-xl border border-dashed px-4 text-xs ${isDark ? "border-white/[0.06] text-white/25" : "border-gray-200 text-gray-400"}`}>
                            {t.emptyHour}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {hourApts.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleAppointmentClick(apt)}
                    onDoubleClick={() => handleAppointmentDoubleClick(apt)}
                    className={`group flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-150 cursor-pointer ${isDark ? "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05]" : "border-gray-100 bg-white hover:bg-gray-50"}`}
                  >
                    {/* Time column */}
                    <div className="w-20 shrink-0 text-center">
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatTime(apt.startTime, language)}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{formatTime(apt.endTime, language)}</p>
                    </div>

                    {/* Color bar */}
                    <div
                      className="h-12 w-1 shrink-0 rounded-full"
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
                        onClick={() => {}}
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
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

          </>
          )}
        </div>
      )}

      {/* ═══ TIMELINE VIEW ═══ */}
      {/* ═══ CALENDAR VIEW ═══ */}
      {viewMode === "calendar" && (
        <div className="space-y-3">

          {/* Calendar grid */}
          {calLoading ? (
            <div className={`flex items-center justify-center gap-3 rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-white"} p-16 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
              {t.loading}
            </div>
          ) : (
            <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02] shadow-[0_8px_40px_rgba(0,0,0,0.3)]" : "border-gray-200 bg-white shadow-sm"}`}>
              {/* Day headers */}
              <div className={`grid grid-cols-7 divide-x ${isDark ? "divide-white/[0.04] border-b border-white/[0.06] bg-white/[0.03]" : "divide-gray-100 border-b border-gray-200 bg-gray-50"}`}>
                {CAL_WEEK_ORDER.map((day) => (
                  <div key={day} className={`py-2.5 text-center text-[11px] font-bold tracking-wider ${day === 0 || day === 6 ? "text-amber-400/60" : isDark ? "text-white/30" : "text-gray-400"}`}>
                    {CAL_DAY_LABELS[language][day]}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {calGrid.map((week, wIdx) => (
                <div key={wIdx} className={`grid grid-cols-7 divide-x ${isDark ? "divide-white/[0.04] border-b border-white/[0.04]" : "divide-gray-100 border-b border-gray-100"} last:border-b-0`}>
                  {week.map((day, dIdx) => {
                    const dayOfWeek = CAL_WEEK_ORDER[dIdx];
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isCalToday =
                      day !== null &&
                      calYear === todayDate.getFullYear() &&
                      calMonth === todayDate.getMonth() &&
                      day === todayDate.getDate();
                    const dayKey = day
                      ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      : null;
                    const dayApts = dayKey ? (calAptsByDay.get(dayKey) ?? []) : [];
                    const visibleApts = dayApts.slice(0, 3);
                    const moreCount = dayApts.length - visibleApts.length;

                    return (
                      <div
                        key={dIdx}
                        onClick={() => {
                          if (day && dayKey) { setDateFilter(dayKey); setViewMode("list"); }
                        }}
                        className={`min-h-[130px] p-2 transition ${day ? "cursor-pointer" : "opacity-25 pointer-events-none"} ${isWeekend ? isDark ? "bg-white/[0.012]" : "bg-amber-50/30" : ""} ${day ? isDark ? "hover:bg-white/[0.04]" : "hover:bg-blue-50/40" : ""}`}
                      >
                        {/* Day number */}
                        <div className="mb-1.5">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold leading-none ${
                            isCalToday
                              ? "bg-violet-500 text-white shadow-[0_0_0_3px_rgba(139,92,246,0.25)]"
                              : isWeekend
                              ? "text-amber-400/60"
                              : isDark ? "text-white/35" : "text-gray-400"
                          }`}>
                            {day ?? ""}
                          </span>
                        </div>

                        {/* Appointment badges */}
                        <div className="space-y-1">
                          {visibleApts.map((apt) => {
                            const s = STATUS_MAP[apt.status] || STATUS_MAP["Scheduled"];
                            const aptColor = apt.treatmentColor || getStaffColor(apt.staffId);
                            const time = new Date(apt.startTime).toLocaleTimeString(language === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" });
                            return (
                              <div
                                key={apt.id}
                                onClick={(e) => { e.stopPropagation(); openDetail(apt.id); }}
                                className={`w-full cursor-pointer rounded-md border px-1.5 py-1 transition hover:opacity-90 hover:brightness-110 ${s.bg}`}
                                style={{ borderLeftColor: aptColor, borderLeftWidth: 2 }}
                              >
                                {/* Row 1: time + customer name */}
                                <div className="flex items-center gap-1">
                                  <span className={`shrink-0 text-[9px] font-bold tabular-nums ${isDark ? "text-white/50" : "text-gray-500"}`}>{time}</span>
                                  <span className="truncate text-[10px] font-semibold leading-tight" style={{ color: aptColor }}>
                                    {apt.customerFullName}
                                  </span>
                                </div>
                                {/* Row 2: treatment · staff */}
                                <div className={`mt-0.5 truncate text-[9px] leading-tight ${isDark ? "text-white/35" : "text-gray-400"}`}>
                                  {apt.treatmentName}
                                  {apt.staffFullName ? <span className="opacity-60"> · {apt.staffFullName.split(" ")[0]}</span> : null}
                                </div>
                              </div>
                            );
                          })}
                          {moreCount > 0 && (
                            <p className={`px-1 text-[9px] font-medium ${isDark ? "text-white/30" : "text-gray-400"}`}>
                              +{moreCount} {t.more}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Hint */}
          <p className={`text-center text-[11px] ${isDark ? "text-white/20" : "text-gray-300"}`}>
            <svg className="mr-1 inline-block" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {t.clickDayHint}
          </p>
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
              <LocaleDateInput
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/25`}
                isDark={isDark}
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
          <div className={`rounded-xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-gray-50"} p-4`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${form.isRecurring ? "border-emerald-500 bg-emerald-500" : isDark ? "border-white/20 bg-white/5" : "border-gray-300 bg-white"}`}>
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

      <Modal open={showQuickComplete} onClose={() => { setShowQuickComplete(false); setQuickCompleteTarget(null); }} title={t.quickCompleteTitle} maxWidth="max-w-lg">
        {quickCompleteTarget && (
          <form onSubmit={handleQuickComplete} className="space-y-5">
            <div className={`rounded-xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{quickCompleteTarget.customerFullName}</p>
              <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>
                <span>{quickCompleteTarget.treatmentName}</span>
                <span>•</span>
                <span>{quickCompleteTarget.staffFullName}</span>
                <span>•</span>
                <span>{formatTime(quickCompleteTarget.startTime, language)}</span>
              </div>
            </div>

            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
              <div>
                <p className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.discount}</p>
                <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-500"}`}>
                  {showDiscountFields
                    ? (language === "tr" ? "İndirim alanları açık" : "Discount fields visible")
                    : `${t.discountHidden} • ${t.discountShortcut}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !showDiscountFields;
                  setShowDiscountFields(next);
                  if (typeof window !== "undefined") window.localStorage.setItem("appointments.showDiscountFields", String(next));
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${isDark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
              >
                {t.discountShortcut}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {showDiscountFields ? t.baseAmount : t.amount}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={(showDiscountFields ? quickCompleteForm.originalAmount : quickCompleteForm.amount) || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (showDiscountFields) updateQuickCompleteForm({ originalAmount: value });
                    else setQuickCompleteForm({ ...quickCompleteForm, amount: value, originalAmount: value });
                  }}
                  className={`w-full rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.currency}</label>
                <select
                  value={quickCompleteForm.currencyId}
                  onChange={(e) => setQuickCompleteForm({ ...quickCompleteForm, currencyId: Number(e.target.value) })}
                  className={`w-full rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none`}
                >
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.id} className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>
                      {currency.symbol} {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showDiscountFields && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.discountType}</label>
                    <select
                      value={quickCompleteForm.discountType}
                      onChange={(e) => updateQuickCompleteForm({ discountType: e.target.value as "amount" | "percent" })}
                      className={`w-full rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none`}
                    >
                      <option value="amount" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{t.discountAmount}</option>
                      <option value="percent" className={isDark ? "bg-[#1a1a2e]" : "bg-white"}>{t.discountPercent}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.discountValue}</label>
                    <input
                      type="number"
                      min={0}
                      step={quickCompleteForm.discountType === "percent" ? 1 : 0.01}
                      value={quickCompleteForm.discountValue || ""}
                      onChange={(e) => updateQuickCompleteForm({ discountValue: Number(e.target.value) })}
                      className={`w-full rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none`}
                    />
                  </div>
                </div>

                <div className={`rounded-xl border px-4 py-3 ${isDark ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? "text-white/60" : "text-gray-600"}>{t.netAmount}</span>
                    <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{quickCompleteForm.amount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentMethod}</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setQuickCompleteForm({ ...quickCompleteForm, paymentMethod: method.value })}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      quickCompleteForm.paymentMethod === method.value
                        ? isDark
                          ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                          : "border-emerald-300 bg-emerald-50 text-gray-900"
                        : isDark
                          ? "border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/5"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {language === "tr" ? method.tr : method.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label>
              <textarea
                value={quickCompleteForm.notes}
                onChange={(e) => setQuickCompleteForm({ ...quickCompleteForm, notes: e.target.value })}
                rows={3}
                className={`w-full rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none`}
                placeholder={t.notesPlaceholder}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={quickCompleting}
                className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50`}
              >
                {quickCompleting ? t.loading : t.quickCompleteSave}
              </button>
              <button
                type="button"
                onClick={() => { setShowQuickComplete(false); setQuickCompleteTarget(null); }}
                className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}
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
                <DetailRow icon="calendar" label={t.dateInfo} value={formatDate(apt.startTime, language)} isDark={isDark} />
                <DetailRow icon="time" label={t.timeInfo} value={`${formatTime(apt.startTime, language)} - ${formatTime(apt.endTime, language)}`} isDark={isDark} />
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
                  <div className={`max-h-32 space-y-1 overflow-y-auto rounded-xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-200 bg-gray-50"} p-2`}>
                    {apt.seriesAppointments.map((sa) => {
                      const ss = STATUS_MAP[sa.status] || STATUS_MAP["Scheduled"];
                      return (
                        <div key={sa.id} className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs ${sa.id === apt.id ? (isDark ? "bg-white/10" : "bg-gray-200") : ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />
                          <span className={`${isDark ? "text-white/50" : "text-gray-500"}`}>{t.session} {sa.sessionNumber}</span>
                          <span className={`${isDark ? "text-white" : "text-gray-900"}`}>{formatDateShort(sa.startTime, language)}</span>
                          <span className={`${isDark ? "text-white/40" : "text-gray-400"}`}>{formatTime(sa.startTime, language)}</span>
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
                      ? `${val.bg} ring-1 ${isDark ? "ring-white/20" : "ring-gray-300"}`
                      : isDark ? "border-white/[0.06] hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                  <span className={`text-sm font-medium ${newStatus === key ? "" : isDark ? "text-white/50" : "text-gray-500"}`}>
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

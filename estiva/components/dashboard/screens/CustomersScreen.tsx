"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { customerService } from "@/services/customerService";
import { customerSchema, getValidationMessage } from "@/lib/validations";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import type {
  CustomerListItem,
  CustomerDetail,
  CustomerHistory,
  CustomerStats,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import ExportButtons from "@/components/ui/ExportButtons";
import SharedStatCard from "@/components/ui/StatCard";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const AVATAR_COLORS = [
  "from-pink-500/40 to-rose-500/40",
  "from-violet-500/40 to-purple-500/40",
  "from-blue-500/40 to-indigo-500/40",
  "from-emerald-500/40 to-teal-500/40",
  "from-amber-500/40 to-orange-500/40",
  "from-cyan-500/40 to-sky-500/40",
  "from-fuchsia-500/40 to-pink-500/40",
  "from-lime-500/40 to-green-500/40",
];

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "text-blue-400",
  Confirmed: "text-emerald-400",
  Completed: "text-green-400",
  Cancelled: "text-red-400",
  NoShow: "text-amber-400",
  Active: "text-emerald-400",
  Expired: "text-amber-400",
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  Scheduled: { en: "Scheduled", tr: "Planlandı" },
  Confirmed: { en: "Confirmed", tr: "Onaylandı" },
  Completed: { en: "Completed", tr: "Tamamlandı" },
  Cancelled: { en: "Cancelled", tr: "İptal" },
  NoShow: { en: "No Show", tr: "Gelmedi" },
  Active: { en: "Active", tr: "Aktif" },
  Expired: { en: "Expired", tr: "Süresi Dolmuş" },
};

const SEGMENT_STYLES: Record<string, { bg: string; text: string; label: Record<string, string> }> = {
  VIP:     { bg: "bg-amber-500/20 border-amber-500/30", text: "text-amber-400", label: { en: "VIP", tr: "VIP" } },
  Regular: { bg: "bg-blue-500/20 border-blue-500/30",   text: "text-blue-400",  label: { en: "Regular", tr: "Düzenli" } },
  New:     { bg: "bg-emerald-500/20 border-emerald-500/30", text: "text-emerald-400", label: { en: "New", tr: "Yeni" } },
  Lost:    { bg: "bg-red-500/20 border-red-500/30",     text: "text-red-400",   label: { en: "Lost", tr: "Kayıp" } },
};

const TAG_COLORS = [
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
];

const SUGGESTED_TAGS = ["VIP", "Hassas Cilt", "Düzenli", "Yeni", "Alerji Var", "Paket Müşteri"];

const copy = {
  en: {
    title: "Customers",
    newCustomer: "New Customer",
    total: "total",
    search: "Search by name, phone or email...",
    loading: "Loading...",
    noData: "No customers yet.",
    noDataSub: "Add your first customer to get started.",
    noResult: "No customers match your search.",
    totalCustomers: "Total Customers",
    vipCustomers: "VIP Customers",
    totalRevenue: "Total Revenue",
    avgSpend: "Avg. Spend",
    tipTotalCustomers: "Total number of active registered customers.",
    tipVip: "Customers with 5.000 ₺+ total spending. Segment is auto-calculated.",
    tipRevenue: "Sum of all customer spending recorded in the system.",
    tipAvgSpend: "Total revenue divided by number of customers. Shows the average spending per customer.",
    createTitle: "New Customer",
    editTitle: "Edit Customer",
    name: "Name",
    surname: "Surname",
    phone: "Phone",
    email: "Email",
    birthDate: "Birth Date",
    notes: "Notes",
    notesPlaceholder: "Customer notes...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    detailTitle: "Customer Profile",
    registered: "Registered",
    noAppointments: "No appointments yet",
    edit: "Edit",
    delete: "Delete Customer",
    confirmDelete: "Are you sure you want to delete this customer?",
    customer: "Customer",
    contact: "Contact",
    visits: "Visits",
    spent: "Spent",
    points: "Points",
    segment: "Segment",
    tabHistory: "Visit History",
    tabPurchases: "Purchases",
    tabPreferences: "Preferences & Notes",
    tabLoyalty: "Loyalty",
    totalVisits: "Total Visits",
    totalSpent: "Total Spent",
    loyaltyPoints: "Loyalty Points",
    customerSince: "Customer Since",
    avgSpendPerVisit: "Avg. per Visit",
    preferredStaff: "Preferred Staff",
    allergies: "Allergies / Sensitivities",
    preferences: "Service Preferences",
    referralSource: "Referral Source",
    tags: "Tags",
    addTag: "Add tag...",
    pointsBalance: "Points Balance",
    addPoints: "Add Points",
    redeemPoints: "Redeem Points",
    tier: "Customer Tier",
    noHistory: "No history yet",
    allergiesPlaceholder: "e.g. Latex allergy, sensitive skin...",
    preferencesPlaceholder: "e.g. Prefers morning appointments...",
    referralPlaceholder: "e.g. Instagram, friend referral...",
  },
  tr: {
    title: "Müşteriler",
    newCustomer: "Yeni Müşteri",
    total: "toplam",
    search: "Ad, telefon veya e-posta ile arayın...",
    loading: "Yükleniyor...",
    noData: "Henüz müşteri yok.",
    noDataSub: "İlk müşterinizi ekleyerek başlayın.",
    noResult: "Aramanızla eşleşen müşteri yok.",
    totalCustomers: "Toplam Müşteri",
    vipCustomers: "VIP Müşteri",
    totalRevenue: "Toplam Gelir",
    avgSpend: "Ort. Harcama",
    tipTotalCustomers: "Sistemde kayıtlı aktif müşteri sayısı.",
    tipVip: "Toplam 5.000 ₺ ve üzeri harcama yapan müşteriler. Segment otomatik hesaplanır.",
    tipRevenue: "Tüm müşterilerin sisteme kayıtlı toplam harcaması.",
    tipAvgSpend: "Toplam gelirin müşteri sayısına bölünmesiyle hesaplanır. Müşteri başına ortalama harcamayı gösterir.",
    createTitle: "Yeni Müşteri",
    editTitle: "Müşteri Düzenle",
    name: "Ad",
    surname: "Soyad",
    phone: "Telefon",
    email: "E-posta",
    birthDate: "Doğum Tarihi",
    notes: "Notlar",
    notesPlaceholder: "Müşteri notları...",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    detailTitle: "Müşteri Profili",
    registered: "Kayıt Tarihi",
    noAppointments: "Henüz randevu yok",
    edit: "Düzenle",
    delete: "Müşteriyi Sil",
    confirmDelete: "Bu müşteriyi silmek istediğinize emin misiniz?",
    customer: "Müşteri",
    contact: "İletişim",
    visits: "Ziyaret",
    spent: "Harcama",
    points: "Puan",
    segment: "Segment",
    tabHistory: "Ziyaret Geçmişi",
    tabPurchases: "Satın Alımlar",
    tabPreferences: "Tercihler & Notlar",
    tabLoyalty: "Sadakat",
    totalVisits: "Toplam Ziyaret",
    totalSpent: "Toplam Harcama",
    loyaltyPoints: "Sadakat Puanı",
    customerSince: "Müşteri Olma Tarihi",
    avgSpendPerVisit: "Ziyaret Başı Ort.",
    preferredStaff: "Tercih Edilen Personel",
    allergies: "Alerjiler / Hassasiyetler",
    preferences: "Hizmet Tercihleri",
    referralSource: "Referans Kaynağı",
    tags: "Etiketler",
    addTag: "Etiket ekle...",
    pointsBalance: "Puan Bakiyesi",
    addPoints: "Puan Ekle",
    redeemPoints: "Puan Kullan",
    tier: "Müşteri Seviyesi",
    noHistory: "Henüz geçmiş yok",
    allergiesPlaceholder: "örn. Lateks alerjisi, hassas cilt...",
    preferencesPlaceholder: "örn. Sabah randevularını tercih eder...",
    referralPlaceholder: "örn. Instagram, arkadaş tavsiyesi...",
  },
};

interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
  allergies: string;
  preferences: string;
  referralSource: string;
}

const emptyForm: FormData = {
  name: "", surname: "", phone: "", email: "", birthDate: "", notes: "",
  allergies: "", preferences: "", referralSource: "",
};

type DetailTab = "history" | "purchases" | "preferences" | "loyalty";

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const formatDate = (d: string | null | undefined, lang: "en" | "tr" = "tr") => {
  if (!d) return "\u2014";
  const date = new Date(d);
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) return "\u2014";
  return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (d: string, lang: "en" | "tr" = "tr") =>
  `${formatDate(d, lang)} ${new Date(d).toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}`;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getInitials = (name: string, surname: string) =>
  `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

const getTagColor = (tag: string) => TAG_COLORS[Math.abs(tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length];

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function SegmentBadge({ segment, language }: { segment: string; language: string }) {
  const s = SEGMENT_STYLES[segment] || SEGMENT_STYLES.New;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}>
      {segment === "VIP" && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
      {s.label[language] || segment}
    </span>
  );
}

function TagPill({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getTagColor(tag)}`}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 transition">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}
    </span>
  );
}

function DetailStatCard({ icon, label, value, isDark }: { icon: React.ReactNode; label: string; value: string | number; isDark: boolean }) {
  return (
    <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 space-y-1`}>
      <div className="flex items-center gap-2">
        <div className={`${isDark ? "text-white/30" : "text-gray-300"}`}>{icon}</div>
        <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
      </div>
      <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function CustomersScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("history");
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [newTag, setNewTag] = useState("");
  const [detailTags, setDetailTags] = useState<string[]>([]);

  /* ═══ DATA FETCHING ═══ */

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerService.list(search || undefined);
      if (res.data.success && res.data.data) setCustomers(res.data.data);
    } catch {
      toast.error(language === "tr" ? "M\u00fc\u015fteriler y\u00fcklenemedi" : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, language]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const vipCount = customers.filter(c => c.segment === "VIP").length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpend = customers.length > 0 ? totalRevenue / customers.length : 0;

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormMode("create");
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await customerService.getById(id);
      if (res.data.success && res.data.data) {
        const c = res.data.data;
        setForm({
          name: c.name, surname: c.surname,
          phone: c.phone || "", email: c.email || "",
          birthDate: c.birthDate ? c.birthDate.split("T")[0] : "",
          notes: c.notes || "",
          allergies: c.allergies || "",
          preferences: c.preferences || "",
          referralSource: c.referralSource || "",
        });
        setEditingId(id);
        setFormMode("edit");
        setFieldErrors({});
        setShowForm(true);
      }
    } catch {
      toast.error(language === "tr" ? "M\u00fc\u015fteri bilgisi al\u0131namad\u0131" : "Failed to load customer");
    }
  };

  const loadDetailData = async (id: number) => {
    setHistoryLoading(true);
    try {
      const [hRes, sRes] = await Promise.allSettled([
        customerService.getHistory(id),
        customerService.getStats(id),
      ]);
      if (hRes.status === "fulfilled" && hRes.value.data.success && hRes.value.data.data) setHistory(hRes.value.data.data);
      if (sRes.status === "fulfilled" && sRes.value.data.success && sRes.value.data.data) setStats(sRes.value.data.data);
    } catch { /* detail modal still shows basic info */ } finally {
      setHistoryLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await customerService.getById(id);
      if (res.data.success && res.data.data) {
        setSelectedDetail(res.data.data);
        setDetailTags(res.data.data.tags || []);
        setDetailTab("history");
        setShowDetail(true);
        loadDetailData(id);
      }
    } catch {
      toast.error(language === "tr" ? "M\u00fc\u015fteri detay\u0131 al\u0131namad\u0131" : "Failed to load customer detail");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = getValidationMessage(issue.message, language);
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {
        name: form.name, surname: form.surname,
        phone: form.phone || undefined, email: form.email || undefined,
        birthDate: form.birthDate || undefined, notes: form.notes || undefined,
        allergies: form.allergies || undefined,
        preferences: form.preferences || undefined,
        referralSource: form.referralSource || undefined,
      };
      if (formMode === "edit" && editingId) {
        await customerService.update(editingId, payload);
        toast.success(language === "tr" ? "M\u00fc\u015fteri g\u00fcncellendi" : "Customer updated");
      } else {
        await customerService.create(payload);
        toast.success(language === "tr" ? "M\u00fc\u015fteri olu\u015fturuldu" : "Customer created");
      }
      setShowForm(false);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "\u0130\u015flem ba\u015far\u0131s\u0131z" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await customerService.delete(id);
      toast.success(language === "tr" ? "M\u00fc\u015fteri silindi" : "Customer deleted");
      setShowDetail(false);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Silme ba\u015far\u0131s\u0131z" : "Delete failed");
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedDetail) return;
    const updated = [...detailTags, newTag.trim()];
    try {
      await customerService.updateTags(selectedDetail.id, { tags: updated });
      setDetailTags(updated);
      setNewTag("");
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Etiket eklenemedi" : "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedDetail) return;
    const updated = detailTags.filter(tg => tg !== tag);
    try {
      await customerService.updateTags(selectedDetail.id, { tags: updated });
      setDetailTags(updated);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Etiket silinemedi" : "Failed to remove tag");
    }
  };

  const handleAddLoyaltyPoints = async (points: number) => {
    if (!selectedDetail) return;
    try {
      await customerService.updateLoyaltyPoints(selectedDetail.id, { points, reason: "Manual adjustment" });
      toast.success(language === "tr" ? "Puanlar g\u00fcncellendi" : "Points updated");
      const res = await customerService.getById(selectedDetail.id);
      if (res.data.success && res.data.data) setSelectedDetail(res.data.data);
      loadDetailData(selectedDetail.id);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Puan g\u00fcncellenemedi" : "Failed to update points");
    }
  };

  /* ═══ SORTING ═══ */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name": return dir * (`${a.name} ${a.surname}`).localeCompare(`${b.name} ${b.surname}`, "tr");
      case "phone": return dir * (a.phone || "").localeCompare(b.phone || "", "tr");
      case "totalVisits": return dir * (a.totalVisits - b.totalVisits);
      case "loyaltyPoints": return dir * (a.loyaltyPoints - b.loyaltyPoints);
      case "totalSpent": return dir * (a.totalSpent - b.totalSpent);
      case "segment": {
        const order: Record<string, number> = { VIP: 4, Premium: 3, Regular: 2, New: 1 };
        return dir * ((order[a.segment] || 0) - (order[b.segment] || 0));
      }
      default: return 0;
    }
  });

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <svg className="inline ml-1 opacity-30" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" /></svg>;
    return sortDir === "asc"
      ? <svg className="inline ml-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 15l5 5 5-5" /></svg>
      : <svg className="inline ml-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 9l5-5 5 5" /></svg>;
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  const inputCls = (field: string) =>
    `w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors[field] ? "border-red-500" : `${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`}`;

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{loading ? <span className={`inline-block h-4 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${customers.length} ${t.total}`}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons
            data={customers as unknown as Record<string, unknown>[]}
            columns={((): ExportColumn[] => {
              const isTr = language === "tr";
              return [
                { header: isTr ? "Ad" : "Name", key: "name" },
                { header: isTr ? "Soyad" : "Surname", key: "surname" },
                { header: isTr ? "Telefon" : "Phone", key: "phone" },
                { header: "E-posta", key: "email" },
                { header: isTr ? "Ziyaret" : "Visits", key: "totalVisits", format: "number" },
                { header: isTr ? "Harcama" : "Spent", key: "totalSpent", format: "currency" },
                { header: isTr ? "Puan" : "Points", key: "loyaltyPoints", format: "number" },
                { header: "Segment", key: "segment" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Müşteriler" : "Customers"}
            pdfTitle={language === "tr" ? "M\u00fc\u015fteri Listesi" : "Customer List"}
          />
          <button
            onClick={openCreate}
            className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newCustomer}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <SharedStatCard
              label={t.totalCustomers}
              value={String(customers.length)}
              valueColor="#f472b6"
              tooltip={t.tipTotalCustomers}
              gradient="bg-pink-500"
              iconColor="text-pink-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <SharedStatCard
              label={t.vipCustomers}
              value={String(vipCount)}
              valueColor="#fbbf24"
              tooltip={t.tipVip}
              gradient="bg-amber-500"
              iconColor="text-amber-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
            />
            <SharedStatCard
              label={t.totalRevenue}
              value={`₺${formatCurrency(totalRevenue)}`}
              valueColor="#a78bfa"
              tooltip={t.tipRevenue}
              gradient="bg-violet-500"
              iconColor="text-violet-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            />
            <SharedStatCard
              label={t.avgSpend}
              value={`₺${formatCurrency(avgSpend)}`}
              valueColor="#60a5fa"
              tooltip={t.tipAvgSpend}
              gradient="bg-blue-500"
              iconColor="text-blue-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            />
          </>
        )}
      </div>

      {/* ─── SEARCH ─── */}
      <div className="relative">
        <svg className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className={`w-full rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-2.5 pl-11 pr-4 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/20" : "focus:border-gray-400"} transition`}
        />
      </div>

      {/* ─── CUSTOMER LIST ─── */}
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} ${isDark ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "shadow-sm"}`}>
        {loading ? (
          <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
            {t.loading}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className={`${isDark ? "text-white/20" : "text-gray-300"}`} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{search ? t.noResult : t.noData}</p>
            {!search && <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`hidden lg:grid grid-cols-[1.2fr_1fr_0.5fr_0.5fr_0.6fr_0.5fr_80px] gap-4 border-b ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("name")}>{t.customer}<SortIcon col="name" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("phone")}>{t.contact}<SortIcon col="phone" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("totalVisits")}>{t.visits}<SortIcon col="totalVisits" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("loyaltyPoints")}>{t.points}<SortIcon col="loyaltyPoints" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("totalSpent")}>{t.spent}<SortIcon col="totalSpent" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("segment")}>{t.segment}<SortIcon col="segment" /></span>
              <span />
            </div>

            <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
              {sortedCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openDetail(c.id)}
                  className={`group grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_0.5fr_0.5fr_0.6fr_0.5fr_80px] gap-2 lg:gap-4 items-center px-5 py-3.5 transition-all duration-150 ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"} cursor-pointer`}
                >
                  {/* Customer */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(c.id)} text-xs font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-sm`}>
                      {getInitials(c.name, c.surname)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{c.name} {c.surname}</p>
                      <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"} lg:hidden`}>{c.phone || c.email || ""}</p>
                    </div>
                  </div>

                  <div className="hidden lg:block min-w-0">
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-600"} truncate`}>{c.phone || "\u2014"}</p>
                    <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"} truncate`}>{c.email || "\u2014"}</p>
                  </div>

                  <p className={`hidden lg:block text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{c.totalVisits}</p>
                  <p className="hidden lg:block text-xs text-amber-400 font-semibold">{c.loyaltyPoints}</p>
                  <p className={`hidden lg:block text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{formatCurrency(c.totalSpent)}</p>

                  <div className="hidden lg:block">
                    <SegmentBadge segment={c.segment} language={language} />
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(c.id)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} ${isDark ? "hover:text-white" : "hover:text-gray-700"}`} title={t.edit}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(c.id)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition hover:bg-red-500/20 hover:text-red-400`} title={t.delete}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`border-t ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-3 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
              {loading ? <span className={`inline-block h-4 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${customers.length} ${t.total}`}
            </div>
          </>
        )}
      </div>

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={formMode === "create" ? t.createTitle : t.editTitle} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.name}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls("name")} />
              {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.surname}</label>
              <input type="text" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} className={inputCls("surname")} />
              {fieldErrors.surname && <p className="text-[11px] text-red-400">{fieldErrors.surname}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.phone}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls("phone")} />
              {fieldErrors.phone && <p className="text-[11px] text-red-400">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.email}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls("email")} />
              {fieldErrors.email && <p className="text-[11px] text-red-400">{fieldErrors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.birthDate}</label>
              <LocaleDateInput value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`} isDark={isDark} />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.referralSource}</label>
              <input type="text" value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} placeholder={t.referralPlaceholder} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/20" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.allergies}</label>
            <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder={t.allergiesPlaceholder} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/20" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`} />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.preferences}</label>
            <input type="text" value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} placeholder={t.preferencesPlaceholder} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/20" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`} />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder={t.notesPlaceholder} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50`}>
              {saving ? t.saving : t.save}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}>
              {t.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══ DETAIL MODAL ═══ */}
      <Modal open={showDetail} onClose={() => { setShowDetail(false); setHistory(null); setStats(null); }} title={t.detailTitle} maxWidth="max-w-3xl">
        {selectedDetail && (() => {
          const c = selectedDetail;
          return (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(c.id)} text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-black/20`}>
                    {getInitials(c.name, c.surname)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{c.name} {c.surname}</p>
                      <SegmentBadge segment={c.segment} language={language} />
                    </div>
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"} mt-0.5`}>{c.phone || ""} {c.email ? `| ${c.email}` : ""}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {detailTags.map(tg => <TagPill key={tg} tag={tg} onRemove={() => handleRemoveTag(tg)} />)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowDetail(false); openEdit(c.id); }} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "text-white/40" : "text-gray-400"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-700"}`} title={t.edit}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400/50 transition hover:bg-red-500/10 hover:text-red-400" title={t.delete}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <DetailStatCard icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label={t.totalVisits} value={c.totalVisits} isDark={isDark} />
                <DetailStatCard icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} label={t.totalSpent} value={formatCurrency(c.totalSpent)} isDark={isDark} />
                <DetailStatCard icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>} label={t.loyaltyPoints} value={c.loyaltyPoints} isDark={isDark} />
                <DetailStatCard icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} label={t.customerSince} value={formatDate(c.customerSince, language)} isDark={isDark} />
                <DetailStatCard icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /></svg>} label={t.avgSpendPerVisit} value={formatCurrency(c.averageSpendPerVisit)} isDark={isDark} />
              </div>

              {/* Tabs */}
              <div className={`flex gap-1 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} p-1`}>
                {([
                  { key: "history" as DetailTab, label: t.tabHistory },
                  { key: "purchases" as DetailTab, label: t.tabPurchases },
                  { key: "preferences" as DetailTab, label: t.tabPreferences },
                  { key: "loyalty" as DetailTab, label: t.tabLoyalty },
                ]).map(tab => (
                  <button key={tab.key} onClick={() => setDetailTab(tab.key)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${detailTab === tab.key ? (isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900") + " shadow-sm" : (isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600")}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {historyLoading ? (
                  <div className={`flex items-center justify-center gap-3 py-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
                    {t.loading}
                  </div>
                ) : (
                  <>
                    {/* TAB 1: Visit History */}
                    {detailTab === "history" && (
                      <div className="space-y-1">
                        {history && history.timeline.filter(i => i.type === "appointment").length > 0 ? (
                          <div className="relative pl-6">
                            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/30 to-transparent" />
                            {history.timeline.filter(i => i.type === "appointment").map((item, idx) => {
                              const statusColor = STATUS_COLORS[item.status || ""] || "text-white/40";
                              return (
                                <div key={`apt-${item.id}-${idx}`} className="relative flex items-start gap-3 py-2.5">
                                  <div className="absolute -left-6 top-3 h-[18px] w-[18px] rounded-full bg-purple-500/30 border-2 border-purple-500/60 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-purple-400" />
                                  </div>
                                  <div className={`flex-1 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 transition ${isDark ? "hover:bg-white/[0.05]" : "hover:bg-gray-100"}`}>
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</p>
                                      <span className={`text-[10px] font-bold ${statusColor}`}>{STATUS_LABELS[item.status || ""]?.[language] || item.status}</span>
                                    </div>
                                    <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                      <span>{formatDateTime(item.date, language)}</span>
                                      {item.staffName && <span>{item.staffName}</span>}
                                      {item.durationMinutes && <span>{item.durationMinutes} dk</span>}
                                      {item.amount != null && item.amount > 0 && <span className="text-emerald-400 font-semibold">{formatCurrency(item.amount)}</span>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-4 py-8 text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.noHistory}</div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: Purchases */}
                    {detailTab === "purchases" && (
                      <div className="space-y-3">
                        {history && history.timeline.filter(i => i.type === "product_purchase" || i.type === "package_purchase").length > 0 ? (
                          history.timeline.filter(i => i.type === "product_purchase" || i.type === "package_purchase").map((item, idx) => (
                            <div key={`pur-${item.id}-${idx}`} className={`flex items-center gap-3 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 transition ${isDark ? "hover:bg-white/[0.05]" : "hover:bg-gray-100"}`}>
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.type === "package_purchase" ? "bg-blue-500/20" : "bg-pink-500/20"}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={item.type === "package_purchase" ? "text-blue-400" : "text-pink-400"}>
                                  {item.type === "package_purchase"
                                    ? <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    : <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{item.title}</p>
                                <div className={`flex gap-3 text-[11px] ${isDark ? "text-white/40" : "text-gray-400"} mt-0.5`}>
                                  <span>{formatDate(item.date, language)}</span>
                                  {item.staffName && <span>{item.staffName}</span>}
                                  {item.status && <span className={STATUS_COLORS[item.status] || "text-white/40"}>{STATUS_LABELS[item.status || ""]?.[language] || item.status}</span>}
                                </div>
                              </div>
                              {item.amount != null && <p className="text-sm font-bold text-emerald-400">{formatCurrency(item.amount)}</p>}
                            </div>
                          ))
                        ) : (
                          <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-4 py-8 text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>
                            {language === "tr" ? "Hen\u00fcz sat\u0131n alma ge\u00e7mi\u015fi yok" : "No purchase history yet"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: Preferences & Notes */}
                    {detailTab === "preferences" && (
                      <div className="space-y-4">
                        {[
                          { label: t.preferredStaff, value: c.preferredStaffName },
                          { label: t.allergies, value: c.allergies },
                          { label: t.preferences, value: c.preferences },
                          { label: t.notes, value: c.notes },
                          { label: t.referralSource, value: c.referralSource },
                        ].map(({ label, value }) => (
                          <div key={label} className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-1`}>
                            <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{label}</p>
                            <p className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>{value || "\u2014"}</p>
                          </div>
                        ))}

                        {/* Tags Management */}
                        <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-3`}>
                          <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.tags}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {detailTags.map(tg => <TagPill key={tg} tag={tg} onRemove={() => handleRemoveTag(tg)} />)}
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} placeholder={t.addTag} className={`flex-1 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-xs ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/20" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"}`} />
                            <button onClick={handleAddTag} className={`rounded-lg ${isDark ? "bg-white/10" : "bg-gray-100"} px-3 py-2 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "hover:bg-white/15" : "hover:bg-gray-200"} transition`}>+</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {SUGGESTED_TAGS.filter(tg => !detailTags.includes(tg)).map(tg => (
                              <button key={tg} onClick={() => setNewTag(tg)} className={`rounded-full border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-2.5 py-0.5 text-[10px] ${isDark ? "text-white/30" : "text-gray-300"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} ${isDark ? "hover:text-white/60" : "hover:text-gray-600"}`}>
                                + {tg}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-1`}>
                            <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.birthDate}</p>
                            <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(c.birthDate, language)}</p>
                          </div>
                          <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-1`}>
                            <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.registered}</p>
                            <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(c.cDate, language)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: Loyalty */}
                    {detailTab === "loyalty" && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 text-center space-y-2">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mx-auto text-amber-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <p className="text-[10px] font-semibold tracking-wider text-amber-400/60">{t.pointsBalance}</p>
                          <p className="text-4xl font-bold text-amber-400">{c.loyaltyPoints}</p>
                          <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Her 100 ₺ harcamada 1 puan" : "1 point per 100 ₺ spent"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleAddLoyaltyPoints(10)} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
                            {t.addPoints} (+10)
                          </button>
                          <button onClick={() => handleAddLoyaltyPoints(-10)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20">
                            {t.redeemPoints} (-10)
                          </button>
                        </div>

                        <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-3`}>
                          <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.tier}</p>
                          <div className="flex items-center gap-3">
                            <SegmentBadge segment={c.segment} language={language} />
                            <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                              {c.segment === "VIP" && (language === "tr" ? "10+ ziyaret veya 5000+ ₺ harcama" : "10+ visits or 5000+ ₺ spent")}
                              {c.segment === "Regular" && (language === "tr" ? "3+ ziyaret" : "3+ visits")}
                              {c.segment === "New" && (language === "tr" ? "Yeni m\u00fc\u015fteri" : "New customer")}
                              {c.segment === "Lost" && (language === "tr" ? "90+ g\u00fcnd\u00fcr ziyaret yok" : "No visit in 90+ days")}
                            </p>
                          </div>
                        </div>

                        {stats && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 space-y-1`}>
                              <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Ziyaret S\u0131kl\u0131\u011f\u0131" : "Visit Frequency"}</p>
                              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.visitFrequencyDays > 0 ? `${stats.visitFrequencyDays} ${language === "tr" ? "g\u00fcn" : "days"}` : "\u2014"}</p>
                            </div>
                            <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 space-y-1`}>
                              <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "En \u00c7ok Kullan\u0131lan" : "Most Used"}</p>
                              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{stats.mostUsedTreatment || "\u2014"}{stats.mostUsedTreatmentCount > 0 && <span className={`${isDark ? "text-white/30" : "text-gray-300"} text-xs ml-1`}>({stats.mostUsedTreatmentCount}x)</span>}</p>
                            </div>
                            <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 space-y-1`}>
                              <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Son Ziyaret" : "Last Visit"}</p>
                              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(stats.lastVisitDate, language)}</p>
                            </div>
                            <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-3 space-y-1`}>
                              <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Sonraki Randevu" : "Next Appointment"}</p>
                              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(stats.nextAppointmentDate, language)}</p>
                            </div>
                          </div>
                        )}

                        {/* Tier progress */}
                        <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-4 space-y-3`}>
                          <p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{language === "tr" ? "Seviye \u0130lerlemesi" : "Tier Progress"}</p>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className={`flex justify-between text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                <span>{language === "tr" ? "Ziyaretler" : "Visits"}</span>
                                <span>{c.totalVisits} / 10</span>
                              </div>
                              <div className={`h-2 rounded-full ${isDark ? "bg-white/[0.06]" : "bg-gray-200"} overflow-hidden`}>
                                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${Math.min(100, (c.totalVisits / 10) * 100)}%` }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className={`flex justify-between text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                <span>{language === "tr" ? "Harcama" : "Spending"}</span>
                                <span>{formatCurrency(c.totalSpent)} / {formatCurrency(5000)}</span>
                              </div>
                              <div className={`h-2 rounded-full ${isDark ? "bg-white/[0.06]" : "bg-gray-200"} overflow-hidden`}>
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${Math.min(100, (c.totalSpent / 5000) * 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

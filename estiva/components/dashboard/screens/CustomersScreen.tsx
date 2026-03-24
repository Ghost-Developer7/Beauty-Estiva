"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { customerService } from "@/services/customerService";
import { customerSchema, getValidationMessage } from "@/lib/validations";
import type { CustomerListItem, CustomerDetail } from "@/types/api";
import Modal from "@/components/ui/Modal";
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
  Planlandı: "text-blue-400",
  Onaylandı: "text-emerald-400",
  Tamamlandı: "text-green-400",
  "İptal Edildi": "text-red-400",
  "Müşteri Gelmedi": "text-amber-400",
};

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
    // Stats
    totalCustomers: "Total Customers",
    thisMonth: "This Month",
    withEmail: "With Email",
    withNotes: "With Notes",
    // Create/Edit
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
    // Detail
    detailTitle: "Customer Profile",
    registered: "Registered",
    lastAppointments: "Recent Appointments",
    noAppointments: "No appointments yet",
    edit: "Edit",
    delete: "Delete Customer",
    confirmDelete: "Are you sure you want to delete this customer?",
    // Table
    customer: "Customer",
    contact: "Contact",
    registeredDate: "Registered",
    notesCol: "Notes",
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
    thisMonth: "Bu Ay Eklenen",
    withEmail: "E-postası Var",
    withNotes: "Notu Var",
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
    lastAppointments: "Son Randevular",
    noAppointments: "Henüz randevu yok",
    edit: "Düzenle",
    delete: "Müşteriyi Sil",
    confirmDelete: "Bu müşteriyi silmek istediğinize emin misiniz?",
    customer: "Müşteri",
    contact: "İletişim",
    registeredDate: "Kayıt Tarihi",
    notesCol: "Notlar",
  },
};

interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
}

const emptyForm: FormData = { name: "", surname: "", phone: "", email: "", birthDate: "", notes: "" };

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (d: string) =>
  `${formatDate(d)} ${new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getInitials = (name: string, surname: string) =>
  `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function CustomersScreen() {
  const { language } = useLanguage();
  const t = copy[language];

  /* ─── Data ─── */
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ─── Create/Edit Modal ─── */
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* ─── Detail Modal ─── */
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);

  /* ═══ DATA FETCHING ═══ */

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerService.list(search || undefined);
      if (res.data.success && res.data.data) setCustomers(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Müşteriler yüklenemedi" : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, language]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  /* ═══ STATS ═══ */

  const now = new Date();
  const thisMonthCount = customers.filter(c => {
    if (!c.cDate) return false;
    const d = new Date(c.cDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const withEmailCount = customers.filter(c => c.email).length;
  const withNotesCount = customers.filter(c => c.notes).length;

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
          name: c.name,
          surname: c.surname,
          phone: c.phone || "",
          email: c.email || "",
          birthDate: c.birthDate ? c.birthDate.split("T")[0] : "",
          notes: c.notes || "",
        });
        setEditingId(id);
        setFormMode("edit");
        setFieldErrors({});
        setShowForm(true);
      }
    } catch {
      toast.error(language === "tr" ? "Müşteri bilgisi alınamadı" : "Failed to load customer");
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await customerService.getById(id);
      if (res.data.success && res.data.data) {
        setSelectedDetail(res.data.data);
        setShowDetail(true);
      }
    } catch {
      toast.error(language === "tr" ? "Müşteri detayı alınamadı" : "Failed to load customer detail");
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
        name: form.name,
        surname: form.surname,
        phone: form.phone || undefined,
        email: form.email || undefined,
        birthDate: form.birthDate || undefined,
        notes: form.notes || undefined,
      };
      if (formMode === "edit" && editingId) {
        await customerService.update(editingId, payload);
        toast.success(language === "tr" ? "Müşteri güncellendi" : "Customer updated");
      } else {
        await customerService.create(payload);
        toast.success(language === "tr" ? "Müşteri oluşturuldu" : "Customer created");
      }
      setShowForm(false);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await customerService.delete(id);
      toast.success(language === "tr" ? "Müşteri silindi" : "Customer deleted");
      setShowDetail(false);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-5 text-white">

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{customers.length} {t.total}</p>
        </div>
        <button
          onClick={openCreate}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {t.newCustomer}
        </button>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.totalCustomers} value={customers.length} color="#f472b6" />
        <StatCard label={t.thisMonth} value={thisMonthCount} color="#60a5fa" />
        <StatCard label={t.withEmail} value={withEmailCount} color="#a78bfa" />
        <StatCard label={t.withNotes} value={withNotesCount} color="#fbbf24" />
      </div>

      {/* ─── SEARCH ─── */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
        />
      </div>

      {/* ─── CUSTOMER LIST ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <p className="text-sm font-medium text-white/40">{search ? t.noResult : t.noData}</p>
            {!search && <p className="text-xs text-white/25">{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_0.6fr_0.8fr_auto] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              <span>{t.customer}</span>
              <span>{t.contact}</span>
              <span>{t.registeredDate}</span>
              <span>{t.notesCol}</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openDetail(c.id)}
                  className="group grid grid-cols-1 md:grid-cols-[1fr_1fr_0.6fr_0.8fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                >
                  {/* Customer */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(c.id)} text-xs font-bold text-white shadow-sm`}>
                      {getInitials(c.name, c.surname)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{c.name} {c.surname}</p>
                      <p className="text-[11px] text-white/30 md:hidden">{c.phone || c.email || ""}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="hidden md:block min-w-0">
                    <p className="text-xs text-white/60 truncate">{c.phone || "—"}</p>
                    <p className="text-[11px] text-white/30 truncate">{c.email || "—"}</p>
                  </div>

                  {/* Registered */}
                  <p className="hidden md:block text-xs text-white/40">{formatDate(c.cDate)}</p>

                  {/* Notes */}
                  <p className="hidden md:block text-xs text-white/30 truncate">{c.notes || "—"}</p>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(c.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white"
                      title={t.edit}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                      title={t.delete}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] bg-white/[0.03] px-5 py-3 text-xs text-white/40">
              {customers.length} {t.total}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
         CREATE / EDIT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={formMode === "create" ? t.createTitle : t.editTitle} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.name}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none ${fieldErrors.name ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
              {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.surname}</label>
              <input
                type="text"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none ${fieldErrors.surname ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
              {fieldErrors.surname && <p className="text-[11px] text-red-400">{fieldErrors.surname}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.phone}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none ${fieldErrors.phone ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
              {fieldErrors.phone && <p className="text-[11px] text-red-400">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none ${fieldErrors.email ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
              {fieldErrors.email && <p className="text-[11px] text-red-400">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.birthDate}</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder={t.notesPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:shadow-green-900/50 disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={t.detailTitle} maxWidth="max-w-lg">
        {selectedDetail && (() => {
          const c = selectedDetail;
          return (
            <div className="space-y-5">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(c.id)} text-lg font-bold text-white shadow-lg`}>
                  {getInitials(c.name, c.surname)}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{c.name} {c.surname}</p>
                  <p className="text-xs text-white/40">{t.registered}: {formatDate(c.cDate)}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.phone}</p>
                  <p className="text-sm text-white">{c.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.email}</p>
                  <p className="text-sm text-white truncate">{c.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.birthDate}</p>
                  <p className="text-sm text-white">{formatDate(c.birthDate)}</p>
                </div>
                {c.notes && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.notes}</p>
                    <p className="text-sm text-white/70">{c.notes}</p>
                  </div>
                )}
              </div>

              {/* Last appointments */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.lastAppointments}</p>
                {c.lastAppointments && c.lastAppointments.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                    {c.lastAppointments.map((apt) => {
                      const statusColor = STATUS_COLORS[apt.statusText] || "text-white/40";
                      return (
                        <div key={apt.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.04]">
                          <div className="h-8 w-1 shrink-0 rounded-full bg-purple-500/50" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white truncate">{apt.treatmentName}</p>
                            <p className="text-[10px] text-white/30">
                              {apt.staffName} {apt.staffSurname} • {formatDateTime(apt.startTime)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold ${statusColor}`}>{apt.statusText}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-xs text-white/25">
                    {t.noAppointments}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowDetail(false); openEdit(c.id); }}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/5"
                >
                  {t.edit}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 transition hover:bg-red-500/20"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

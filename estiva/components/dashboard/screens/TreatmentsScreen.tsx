"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { treatmentService } from "@/services/treatmentService";
import { treatmentSchema, getValidationMessage } from "@/lib/validations";
import type { TreatmentListItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#e879f9", "#fb923c", "#a3e635", "#f43f5e",
];

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const copy = {
  en: {
    title: "Treatments & Services",
    newTreatment: "New Treatment",
    total: "total",
    search: "Search treatments...",
    loading: "Loading...",
    noData: "No treatments yet.",
    noDataSub: "Add your first treatment to start booking appointments.",
    noResult: "No treatments match your search.",
    // Stats
    totalTreatments: "Total Treatments",
    avgPrice: "Avg Price",
    avgDuration: "Avg Duration",
    priceRange: "Price Range",
    min: "min",
    // Form
    createTitle: "New Treatment",
    editTitle: "Edit Treatment",
    name: "Treatment Name",
    namePlaceholder: "e.g. Hair Coloring, Manicure...",
    description: "Description",
    descPlaceholder: "Optional description...",
    duration: "Duration",
    price: "Price",
    color: "Calendar Color",
    colorSub: "Used to identify this treatment in the calendar",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    // Detail
    detailTitle: "Treatment Details",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this treatment?",
    // List
    treatment: "Treatment",
    durationCol: "Duration",
    priceCol: "Price",
  },
  tr: {
    title: "Hizmetler",
    newTreatment: "Yeni Hizmet",
    total: "toplam",
    search: "Hizmet ara...",
    loading: "Yükleniyor...",
    noData: "Henüz hizmet yok.",
    noDataSub: "Randevu almaya başlamak için ilk hizmetinizi ekleyin.",
    noResult: "Aramanızla eşleşen hizmet yok.",
    totalTreatments: "Toplam Hizmet",
    avgPrice: "Ort. Fiyat",
    avgDuration: "Ort. Süre",
    priceRange: "Fiyat Aralığı",
    min: "dk",
    createTitle: "Yeni Hizmet",
    editTitle: "Hizmet Düzenle",
    name: "Hizmet Adı",
    namePlaceholder: "örn. Saç Boyama, Manikür...",
    description: "Açıklama",
    descPlaceholder: "İsteğe bağlı açıklama...",
    duration: "Süre",
    price: "Fiyat",
    color: "Takvim Rengi",
    colorSub: "Takvimde bu hizmeti ayırt etmek için kullanılır",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    detailTitle: "Hizmet Detayı",
    edit: "Düzenle",
    delete: "Sil",
    confirmDelete: "Bu hizmeti silmek istediğinize emin misiniz?",
    treatment: "Hizmet",
    durationCol: "Süre",
    priceCol: "Fiyat",
  },
};

interface FormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  color: string;
}

const emptyForm: FormData = { name: "", description: "", durationMinutes: 30, price: 0, color: COLORS[0] };

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function TreatmentsScreen() {
  const { language } = useLanguage();
  const t = copy[language];

  /* ─── Data ─── */
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* ─── Form Modal ─── */
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* ─── Detail Modal ─── */
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentListItem | null>(null);

  /* ═══ DATA FETCHING ═══ */

  const fetchTreatments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await treatmentService.listPaginated({ pageNumber: page, pageSize });
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setTreatments(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const res = await treatmentService.list();
        if (res.data.success && res.data.data) {
          setTreatments(res.data.data);
          setTotalCount(res.data.data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(language === "tr" ? "Hizmetler yüklenemedi" : "Failed to load treatments");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, language]);

  useEffect(() => { fetchTreatments(); }, [fetchTreatments]);

  /* ═══ FILTERED & STATS ═══ */

  const filtered = treatments.filter((tr) => {
    if (!search) return true;
    return tr.name.toLowerCase().includes(search.toLowerCase()) ||
      tr.description?.toLowerCase().includes(search.toLowerCase());
  });

  const avgPrice = treatments.length > 0 ? treatments.reduce((s, tr) => s + (tr.price ?? 0), 0) / treatments.length : 0;
  const avgDuration = treatments.length > 0 ? treatments.reduce((s, tr) => s + tr.durationMinutes, 0) / treatments.length : 0;
  const minPrice = treatments.length > 0 ? Math.min(...treatments.map(tr => tr.price ?? 0)) : 0;
  const maxPrice = treatments.length > 0 ? Math.max(...treatments.map(tr => tr.price ?? 0)) : 0;

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormMode("create");
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (item: TreatmentListItem) => {
    setForm({
      name: item.name,
      description: item.description || "",
      durationMinutes: item.durationMinutes,
      price: item.price ?? 0,
      color: item.color || COLORS[0],
    });
    setEditingId(item.id);
    setFormMode("edit");
    setFieldErrors({});
    setShowForm(true);
  };

  const openDetail = (item: TreatmentListItem) => {
    setSelectedTreatment(item);
    setShowDetail(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = treatmentSchema.safeParse(form);
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
        description: form.description || undefined,
        durationMinutes: form.durationMinutes,
        price: form.price,
        color: form.color || undefined,
      };
      if (formMode === "edit" && editingId) {
        await treatmentService.update(editingId, payload);
        toast.success(language === "tr" ? "Hizmet güncellendi" : "Treatment updated");
      } else {
        await treatmentService.create(payload);
        toast.success(language === "tr" ? "Hizmet oluşturuldu" : "Treatment created");
      }
      setShowForm(false);
      fetchTreatments();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await treatmentService.delete(id);
      toast.success(language === "tr" ? "Hizmet silindi" : "Treatment deleted");
      setShowDetail(false);
      fetchTreatments();
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
          <p className="mt-0.5 text-sm text-white/40">{treatments.length} {t.total}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons
            data={filtered as unknown as Record<string, unknown>[]}
            columns={((): ExportColumn[] => {
              const isTr = language === "tr";
              return [
                { header: isTr ? "Hizmet Adı" : "Treatment Name", key: "name" },
                { header: isTr ? "Açıklama" : "Description", key: "description" },
                { header: isTr ? "Süre (dk)" : "Duration (min)", key: "durationMinutes", format: "number" },
                { header: isTr ? "Fiyat" : "Price", key: "price", format: "currency" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Hizmetler" : "Treatments"}
            pdfTitle={language === "tr" ? "Hizmet Listesi" : "Treatments List"}
          />
          <button
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newTreatment}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.totalTreatments} value={String(treatments.length)} color="#a78bfa" />
        <StatCard label={t.avgPrice} value={`₺${fmt(avgPrice)}`} color="#22c55e" />
        <StatCard label={t.avgDuration} value={`${Math.round(avgDuration)} ${t.min}`} color="#60a5fa" />
        <StatCard label={t.priceRange} value={treatments.length > 0 ? `₺${fmt(minPrice)} — ₺${fmt(maxPrice)}` : "—"} color="#fbbf24" />
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

      {/* ─── TREATMENT LIST ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></svg>
            <p className="text-sm font-medium text-white/40">{search ? t.noResult : t.noData}</p>
            {!search && <p className="text-xs text-white/25">{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_0.5fr_0.5fr_auto] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold tracking-wider text-white/30">
              <span>{t.treatment}</span>
              <span>{t.durationCol}</span>
              <span>{t.priceCol}</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((item) => {
                const color = item.color || "#a78bfa";
                return (
                  <div
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className="group grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                  >
                    {/* Treatment name + color + description */}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-white/30 truncate">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden md:flex items-center gap-1.5">
                      <svg className="text-white/20" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      <span className="text-xs text-white/50">{item.durationMinutes} {t.min}</span>
                    </div>

                    {/* Price */}
                    <p className="hidden md:block text-sm font-bold text-white">₺{fmt(item.price ?? 0)}</p>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white"
                        title={t.edit}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                        title={t.delete}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
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

      {/* ═══════════════════════════════════════════
         CREATE / EDIT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={formMode === "create" ? t.createTitle : t.editTitle} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-white/40">{t.name}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.namePlaceholder}
              className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none ${fieldErrors.name ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
            />
            {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-white/40">{t.description}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder={t.descPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-white/40">{t.duration}</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, durationMinutes: d })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    form.durationMinutes === d
                      ? "border-white/20 bg-white/10 text-white ring-1 ring-white/20"
                      : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white/60"
                  }`}
                >
                  {d} {t.min}
                </button>
              ))}
              <input
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className={`w-20 rounded-lg border bg-white/5 px-2.5 py-2 text-center text-xs text-white focus:outline-none ${fieldErrors.durationMinutes ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
            </div>
            {fieldErrors.durationMinutes && <p className="text-[11px] text-red-400">{fieldErrors.durationMinutes}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-white/40">{t.price}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">₺</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="0"
                className={`w-full rounded-xl border bg-white/5 py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none ${fieldErrors.price ? "border-red-500" : "border-white/10 focus:border-white/25"}`}
              />
            </div>
            {fieldErrors.price && <p className="text-[11px] text-red-400">{fieldErrors.price}</p>}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-white/40">{t.color}</label>
            <p className="text-[10px] text-white/25">{t.colorSub}</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full transition-all duration-150 ${
                    form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: form.color }} />
            <div>
              <p className="text-sm font-semibold text-white">{form.name || t.namePlaceholder}</p>
              <p className="text-[10px] text-white/30">{form.durationMinutes} {t.min} • ₺{form.price || 0}</p>
            </div>
          </div>

          {/* Submit */}
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
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={t.detailTitle} maxWidth="max-w-md">
        {selectedTreatment && (() => {
          const item = selectedTreatment;
          const color = item.color || "#a78bfa";
          return (
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{item.name}</p>
                  {item.description && <p className="text-xs text-white/40">{item.description}</p>}
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.durationCol}</p>
                  <p className="mt-1 text-lg font-bold text-white">{item.durationMinutes}</p>
                  <p className="text-[10px] text-white/30">{t.min}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.priceCol}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">₺{fmt(item.price ?? 0)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-[10px] text-white/30">{t.color}</p>
                  <div className="mt-2 mx-auto h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowDetail(false); openEdit(item); }}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/5"
                >
                  {t.edit}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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

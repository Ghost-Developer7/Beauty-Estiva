"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { treatmentService } from "@/services/treatmentService";
import { treatmentSchema, getValidationMessage } from "@/lib/validations";
import type { TreatmentListItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import SharedStatCard from "@/components/ui/StatCard";
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
    tipTotal: "Total active services offered by the salon.",
    tipAvgPrice: "Average price across all services.",
    tipAvgDuration: "Average session duration across all services.",
    tipPriceRange: "Lowest and highest priced services.",
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
    confirmDeleteSub: "This action cannot be undone.",
    confirmDeleteBtn: "Delete",
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
    tipTotal: "Salonda sunulan aktif hizmet sayısı.",
    tipAvgPrice: "Tüm hizmetlerin fiyat ortalaması.",
    tipAvgDuration: "Tüm hizmetlerin süre ortalaması.",
    tipPriceRange: "En düşük ve en yüksek fiyatlı hizmetler.",
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
    confirmDeleteSub: "Bu işlem geri alınamaz.",
    confirmDeleteBtn: "Sil",
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

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function TreatmentsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  /* ─── Data ─── */
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ─── Sorting ─── */
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(prev => prev === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <svg className="inline ml-1 opacity-30" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" /></svg>;
    return sortDir === "asc"
      ? <svg className="inline ml-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 15l5 5 5-5" /></svg>
      : <svg className="inline ml-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 9l5-5 5 5" /></svg>;
  };

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

  /* ─── Delete Confirm ─── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  }).sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name": return dir * a.name.localeCompare(b.name, "tr");
      case "durationMinutes": return dir * (a.durationMinutes - b.durationMinutes);
      case "price": return dir * ((a.price ?? 0) - (b.price ?? 0));
      default: return 0;
    }
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

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await treatmentService.delete(deleteTargetId);
      toast.success(language === "tr" ? "Hizmet silindi" : "Treatment deleted");
      setShowDeleteConfirm(false);
      setShowDetail(false);
      fetchTreatments();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    } finally {
      setDeleting(false);
    }
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
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{loading ? <span className={`inline-block h-4 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${treatments.length} ${t.total}`}</p>
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
            className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newTreatment}
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
              label={t.totalTreatments}
              value={String(treatments.length)}
              valueColor="#a78bfa"
              tooltip={t.tipTotal}
              gradient="bg-violet-500"
              iconColor="text-violet-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a9 9 0 100 18A9 9 0 0012 2z"/><path d="M9 12h6M12 9v6"/></svg>}
            />
            <SharedStatCard
              label={t.avgPrice}
              value={`₺${fmt(avgPrice)}`}
              valueColor="#22c55e"
              tooltip={t.tipAvgPrice}
              gradient="bg-emerald-500"
              iconColor="text-emerald-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            />
            <SharedStatCard
              label={t.avgDuration}
              value={`${Math.round(avgDuration)} ${t.min}`}
              valueColor="#60a5fa"
              tooltip={t.tipAvgDuration}
              gradient="bg-blue-500"
              iconColor="text-blue-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <SharedStatCard
              label={t.priceRange}
              value={treatments.length > 0 ? `₺${fmt(minPrice)} — ₺${fmt(maxPrice)}` : "—"}
              valueColor="#fbbf24"
              tooltip={t.tipPriceRange}
              gradient="bg-amber-500"
              iconColor="text-amber-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
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

      {/* ─── TREATMENT LIST ─── */}
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} ${isDark ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "shadow-sm"}`}>
        {loading ? (
          <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className={isDark ? "text-white/20" : "text-gray-300"} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></svg>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{search ? t.noResult : t.noData}</p>
            {!search && <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`hidden md:grid grid-cols-[1fr_0.5fr_0.5fr_68px] gap-4 border-b ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>
              <span className="cursor-pointer select-none hover:opacity-80 pl-[18px]" onClick={() => handleSort("name")}>{t.treatment}<SortIcon col="name" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("durationMinutes")}>{t.durationCol}<SortIcon col="durationMinutes" /></span>
              <span className="cursor-pointer select-none hover:opacity-80" onClick={() => handleSort("price")}>{t.priceCol}<SortIcon col="price" /></span>
              <span />
            </div>

            {/* Rows */}
            <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
              {filtered.map((item) => {
                const color = item.color || "#a78bfa";
                return (
                  <div
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className={`group grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_68px] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"} cursor-pointer`}
                  >
                    {/* Treatment name + color + description */}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{item.name}</p>
                        </div>
                        {item.description && (
                          <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"} truncate`}>{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <span className={`hidden md:block text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{item.durationMinutes} {t.min}</span>

                    {/* Price */}
                    <p className={`hidden md:block text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt(item.price ?? 0)}</p>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(item)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} ${isDark ? "hover:text-white" : "hover:text-gray-700"}`}
                        title={t.edit}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition hover:bg-red-500/20 hover:text-red-400`}
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
         DELETE CONFIRM MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={language === "tr" ? "Hizmeti Sil" : "Delete Treatment"} maxWidth="max-w-sm">
        <div className="space-y-5">
          <div className={`flex items-start gap-3 rounded-xl border ${isDark ? "border-red-500/20 bg-red-500/10" : "border-red-200 bg-red-50"} px-4 py-3`}>
            <svg className="mt-0.5 shrink-0 text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.confirmDelete}</p>
              <p className={`mt-0.5 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.confirmDeleteSub}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? (language === "tr" ? "Siliniyor..." : "Deleting...") : t.confirmDeleteBtn}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-2.5 text-sm font-medium ${isDark ? "text-white/60 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} transition`}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════
         CREATE / EDIT MODAL
         ═══════════════════════════════════════════ */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={formMode === "create" ? t.createTitle : t.editTitle} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.name}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.namePlaceholder}
              className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${fieldErrors.name ? "border-red-500" : isDark ? "border-white/10 focus:border-white/25" : "border-gray-200 focus:border-gray-400"}`}
            />
            {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.description}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder={t.descPlaceholder}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} resize-none`}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.duration}</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, durationMinutes: d })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    form.durationMinutes === d
                      ? isDark ? "border-white/20 bg-white/10 text-white ring-1 ring-white/20" : "border-gray-400 bg-gray-100 text-gray-900 ring-1 ring-gray-400"
                      : isDark ? "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white/60" : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  {d} {t.min}
                </button>
              ))}
            </div>
            {fieldErrors.durationMinutes && <p className="text-[11px] text-red-400">{fieldErrors.durationMinutes}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.price}</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-gray-300"}`}>₺</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="0"
                className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-8 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors.price ? "border-red-500" : isDark ? "border-white/10 focus:border-white/25" : "border-gray-200 focus:border-gray-400"}`}
              />
            </div>
            {fieldErrors.price && <p className="text-[11px] text-red-400">{fieldErrors.price}</p>}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.color}</label>
            <p className={`text-[10px] ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.colorSub}</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full transition-all duration-150 ${
                    form.color === c ? `border-[3px] ${isDark ? "border-white" : "border-gray-800"} shadow-lg scale-110` : "border-2 border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-4 py-3`}>
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: form.color }} />
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{form.name || t.namePlaceholder}</p>
              <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{form.durationMinutes} {t.min} • ₺{form.price || 0}</p>
            </div>
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
              onClick={() => setShowForm(false)}
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
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                  {item.description && <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{item.description}</p>}
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.durationCol}</p>
                  <p className={`mt-1 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.durationMinutes}</p>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.min}</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.priceCol}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">₺{fmt(item.price ?? 0)}</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.color}</p>
                  <div className="mt-2 mx-auto h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowDetail(false); openEdit(item); }}
                  className={`flex-1 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
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

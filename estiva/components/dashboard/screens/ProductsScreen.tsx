"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { productService } from "@/services/productService";
import { productSchema, getValidationMessage } from "@/lib/validations";
import type { ProductListItem } from "@/types/api";
import SharedStatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    title: "Products",
    newProduct: "New Product",
    total: "total",
    search: "Search products...",
    loading: "Loading...",
    noData: "No products yet.",
    noDataSub: "Add your first product to start selling.",
    noResult: "No products match your search.",
    // Stats
    totalProducts: "Total Products",
    avgPrice: "Avg Price",
    lowStock: "Low Stock",
    totalValue: "Total Stock Value",
    // Form
    createTitle: "New Product",
    editTitle: "Edit Product",
    name: "Product Name",
    namePlaceholder: "e.g. Shampoo, Hair Serum...",
    description: "Description",
    descPlaceholder: "Optional description...",
    barcode: "Barcode",
    barcodePlaceholder: "Optional barcode...",
    price: "Price",
    stock: "Stock Quantity",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    // Detail
    detailTitle: "Product Details",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this product?",
    // List
    product: "Product",
    barcodeCol: "Barcode",
    priceCol: "Price",
    stockCol: "Stock",
    items: "items",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
  },
  tr: {
    title: "Ürünler",
    newProduct: "Yeni Ürün",
    total: "toplam",
    search: "Ürün ara...",
    loading: "Yükleniyor...",
    noData: "Henüz ürün yok.",
    noDataSub: "Satış yapmaya başlamak için ilk ürününüzü ekleyin.",
    noResult: "Aramanızla eşleşen ürün yok.",
    totalProducts: "Toplam Ürün",
    avgPrice: "Ort. Fiyat",
    lowStock: "Düşük Stok",
    totalValue: "Toplam Stok Değeri",
    createTitle: "Yeni Ürün",
    editTitle: "Ürün Düzenle",
    name: "Ürün Adı",
    namePlaceholder: "örn. Şampuan, Saç Serumu...",
    description: "Açıklama",
    descPlaceholder: "İsteğe bağlı açıklama...",
    barcode: "Barkod",
    barcodePlaceholder: "İsteğe bağlı barkod...",
    price: "Fiyat",
    stock: "Stok Adedi",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "Vazgeç",
    detailTitle: "Ürün Detayı",
    edit: "Düzenle",
    delete: "Sil",
    confirmDelete: "Bu ürünü silmek istediğinize emin misiniz?",
    product: "Ürün",
    barcodeCol: "Barkod",
    priceCol: "Fiyat",
    stockCol: "Stok",
    items: "adet",
    inStock: "Stokta",
    outOfStock: "Tükendi",
  },
};

interface FormData {
  name: string;
  description: string;
  barcode: string;
  price: number;
  stockQuantity: number;
}

const emptyForm: FormData = { name: "", description: "", barcode: "", price: 0, stockQuantity: 0 };

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StockBadge({ quantity, isDark, t }: { quantity: number; isDark: boolean; t: typeof copy.en }) {
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        {t.outOfStock}
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {quantity} {t.items}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {quantity} {t.items}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function ProductsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  /* ─── Data ─── */
  const [products, setProducts] = useState<ProductListItem[]>([]);
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
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);

  /* ═══ DATA FETCHING ═══ */

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.list();
      if (res.data.success && res.data.data) {
        const all = res.data.data;
        setProducts(all);
        setTotalCount(all.length);
        setTotalPages(Math.ceil(all.length / pageSize));
      }
    } catch {
      toast.error(language === "tr" ? "Ürünler yüklenemedi" : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [pageSize, language]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ═══ FILTERED & STATS ═══ */

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q);
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const avgPrice = products.length > 0 ? products.reduce((s, p) => s + p.price, 0) / products.length : 0;
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stockQuantity, 0);

  /* ═══ ACTIONS ═══ */

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormMode("create");
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (item: ProductListItem) => {
    setForm({
      name: item.name,
      description: item.description || "",
      barcode: item.barcode || "",
      price: item.price,
      stockQuantity: item.stockQuantity,
    });
    setEditingId(item.id);
    setFormMode("edit");
    setFieldErrors({});
    setShowForm(true);
  };

  const openDetail = (item: ProductListItem) => {
    setSelectedProduct(item);
    setShowDetail(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse({
      ...form,
      description: form.description || undefined,
      barcode: form.barcode || undefined,
      stockQuantity: form.stockQuantity || undefined,
    });
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
        barcode: form.barcode || undefined,
        price: form.price,
        stockQuantity: form.stockQuantity,
      };
      if (formMode === "edit" && editingId) {
        await productService.update(editingId, payload);
        toast.success(language === "tr" ? "Ürün güncellendi" : "Product updated");
      } else {
        await productService.create(payload);
        toast.success(language === "tr" ? "Ürün oluşturuldu" : "Product created");
      }
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await productService.delete(id);
      toast.success(language === "tr" ? "Ürün silindi" : "Product deleted");
      setShowDetail(false);
      fetchProducts();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
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
          <p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{loading ? <span className={`inline-block h-4 w-16 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} /> : `${products.length} ${t.total}`}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons
            data={filtered as unknown as Record<string, unknown>[]}
            columns={((): ExportColumn[] => {
              const isTr = language === "tr";
              return [
                { header: isTr ? "Ürün Adı" : "Product Name", key: "name" },
                { header: isTr ? "Açıklama" : "Description", key: "description" },
                { header: isTr ? "Barkod" : "Barcode", key: "barcode" },
                { header: isTr ? "Fiyat" : "Price", key: "price", format: "currency" },
                { header: isTr ? "Stok" : "Stock", key: "stockQuantity", format: "number" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Urunler" : "Products"}
            pdfTitle={language === "tr" ? "Ürün Listesi" : "Products List"}
          />
          <button
            onClick={openCreate}
            className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newProduct}
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
              label={t.totalProducts}
              value={String(products.length)}
              valueColor="#a78bfa"
              gradient="bg-violet-500"
              iconColor="text-violet-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
            />
            <SharedStatCard
              label={t.avgPrice}
              value={`₺${fmt(avgPrice)}`}
              valueColor="#22c55e"
              gradient="bg-emerald-500"
              iconColor="text-emerald-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            />
            <SharedStatCard
              label={t.lowStock}
              value={String(lowStockCount)}
              sub={`≤ 5 ${t.items}`}
              valueColor="#f59e0b"
              gradient="bg-amber-500"
              iconColor="text-amber-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            />
            <SharedStatCard
              label={t.totalValue}
              value={`₺${fmt(totalValue)}`}
              valueColor="#60a5fa"
              gradient="bg-blue-500"
              iconColor="text-blue-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
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
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t.search}
          className={`w-full rounded-xl border ${isDark ? "border-white/[0.08]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-2.5 pl-11 pr-4 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/20" : "focus:border-gray-400"} transition`}
        />
      </div>

      {/* ─── PRODUCT LIST ─── */}
      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} ${isDark ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "shadow-sm"}`}>
        {loading ? (
          <div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className={isDark ? "text-white/20" : "text-gray-300"} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{search ? t.noResult : t.noData}</p>
            {!search && <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`hidden md:grid grid-cols-[1fr_0.8fr_0.5fr_0.5fr_auto] gap-4 border-b ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>
              <span>{t.product}</span>
              <span>{t.barcodeCol}</span>
              <span>{t.priceCol}</span>
              <span>{t.stockCol}</span>
              <span />
            </div>

            {/* Rows */}
            <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-gray-100"}`}>
              {paged.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openDetail(item)}
                  className={`group grid grid-cols-1 md:grid-cols-[1fr_0.8fr_0.5fr_0.5fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"} cursor-pointer`}
                >
                  {/* Product name + description */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{item.name}</p>
                      {item.description && (
                        <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"} truncate`}>{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Barcode */}
                  <p className={`hidden md:block text-xs ${isDark ? "text-white/40" : "text-gray-400"} font-mono`}>{item.barcode || "—"}</p>

                  {/* Price */}
                  <p className={`hidden md:block text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt(item.price)}</p>

                  {/* Stock */}
                  <div className="hidden md:block">
                    <StockBadge quantity={item.stockQuantity} isDark={isDark} t={t} />
                  </div>

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
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              pageNumber={page}
              pageSize={pageSize}
              totalCount={filtered.length}
              totalPages={Math.ceil(filtered.length / pageSize)}
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

          {/* Barcode */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.barcode}</label>
            <input
              type="text"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder={t.barcodePlaceholder}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none ${isDark ? "focus:border-white/25" : "focus:border-gray-400"} font-mono`}
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.stock}</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.stockQuantity || ""}
                onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                placeholder="0"
                className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors.stockQuantity ? "border-red-500" : isDark ? "border-white/10 focus:border-white/25" : "border-gray-200 focus:border-gray-400"}`}
              />
              {fieldErrors.stockQuantity && <p className="text-[11px] text-red-400">{fieldErrors.stockQuantity}</p>}
            </div>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-white"} px-4 py-3`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{form.name || t.namePlaceholder}</p>
              <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>₺{form.price || 0} • {form.stockQuantity || 0} {t.items}</p>
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
        {selectedProduct && (() => {
          const item = selectedProduct;
          return (
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                  {item.description && <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{item.description}</p>}
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.priceCol}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">₺{fmt(item.price)}</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.stockCol}</p>
                  <p className={`mt-1 text-lg font-bold ${item.stockQuantity <= 0 ? "text-red-400" : item.stockQuantity <= 5 ? "text-amber-400" : isDark ? "text-white" : "text-gray-900"}`}>{item.stockQuantity}</p>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.items}</p>
                </div>
                <div className={`rounded-xl border ${isDark ? "border-white/[0.06]" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-3 text-center`}>
                  <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.barcodeCol}</p>
                  <p className={`mt-1 text-sm font-mono ${isDark ? "text-white/60" : "text-gray-600"} truncate`}>{item.barcode || "—"}</p>
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

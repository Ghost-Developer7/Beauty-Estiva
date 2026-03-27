"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { productService } from "@/services/productService";
import { customerService } from "@/services/customerService";
import { currencyService } from "@/services/currencyService";
import { staffService, type StaffMember } from "@/services/staffService";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import type { ProductListItem, ProductSaleListItem, CustomerListItem, CurrencyItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

/* ═══ CONSTANTS ═══ */

const PAYMENT_METHODS: { value: string; en: string; tr: string; icon: string }[] = [
  { value: "Cash", en: "Cash", tr: "Nakit", icon: "💵" },
  { value: "CreditCard", en: "Credit Card", tr: "Kredi Kartı", icon: "💳" },
  { value: "BankTransfer", en: "Bank Transfer", tr: "Havale/EFT", icon: "🏦" },
  { value: "Check", en: "Check", tr: "Çek", icon: "📄" },
  { value: "Other", en: "Other", tr: "Diğer", icon: "📋" },
];

const METHOD_COLORS: Record<string, string> = { "Nakit": "#22c55e", "Cash": "#22c55e", "Kredi / Banka Kartı": "#6366f1", "Credit Card": "#6366f1", "Havale / EFT": "#3b82f6", "Bank Transfer": "#3b82f6", "Çek": "#f59e0b", "Check": "#f59e0b", "Diğer": "#8b5cf6", "Other": "#8b5cf6" };

type TabMode = "sales" | "products";

const copy = {
  en: {
    title: "Product Sales", salesTab: "Sales", productsTab: "Products", newSale: "New Sale", newProduct: "New Product", total: "total", search: "Search...", loading: "Loading...",
    noSales: "No product sales yet.", noSalesSub: "Record your first product sale.", noProducts: "No products yet.", noProductsSub: "Add products to start selling.",
    totalRevenue: "Total Revenue", totalSales: "Sales Count", totalProducts: "Products", lowStock: "Low Stock",
    createSaleTitle: "New Product Sale", product: "Product", selectProduct: "Select product...", customer: "Customer (optional)", searchCustomer: "Search customer...",
    quantity: "Quantity", paymentMethod: "Payment Method", currency: "Currency", exchangeRate: "Exchange Rate", notes: "Notes", notesPlaceholder: "Optional notes...",
    recordSale: "Record Sale", recording: "Recording...", cancel: "Cancel", unitPrice: "Unit price", totalAmount: "Total", stock: "Stock", pcs: "pcs",
    createProductTitle: "New Product", editProductTitle: "Edit Product", productName: "Product Name", productNamePh: "e.g. Keratin Shampoo...",
    description: "Description", descPh: "Optional description...", barcode: "Barcode", price: "Price", stockQty: "Stock Quantity", save: "Save", saving: "Saving...",
    saleDetailTitle: "Sale Details", seller: "Seller", saleDate: "Date", delete: "Delete", confirmDelete: "Delete this record?", edit: "Edit",
    productCol: "Product", customerCol: "Customer", qtyCol: "Qty", amountCol: "Amount", methodCol: "Method", dateCol: "Date", priceCol: "Price", stockCol: "Stock", allStaff: "All Staff",
  },
  tr: {
    title: "Ürün Satışları", salesTab: "Satışlar", productsTab: "Ürünler", newSale: "Yeni Satış", newProduct: "Yeni Ürün", total: "toplam", search: "Ara...", loading: "Yükleniyor...",
    noSales: "Henüz ürün satışı yok.", noSalesSub: "İlk ürün satışınızı kaydedin.", noProducts: "Henüz ürün yok.", noProductsSub: "Satış yapmak için ürün ekleyin.",
    totalRevenue: "Toplam Gelir", totalSales: "Satış Sayısı", totalProducts: "Ürün Sayısı", lowStock: "Düşük Stok",
    createSaleTitle: "Yeni Ürün Satışı", product: "Ürün", selectProduct: "Ürün seçin...", customer: "Müşteri (isteğe bağlı)", searchCustomer: "Müşteri ara...",
    quantity: "Adet", paymentMethod: "Ödeme Yöntemi", currency: "Para Birimi", exchangeRate: "Döviz Kuru", notes: "Notlar", notesPlaceholder: "İsteğe bağlı notlar...",
    recordSale: "Satış Kaydet", recording: "Kaydediliyor...", cancel: "Vazgeç", unitPrice: "Birim fiyat", totalAmount: "Toplam", stock: "Stok", pcs: "adet",
    createProductTitle: "Yeni Ürün", editProductTitle: "Ürün Düzenle", productName: "Ürün Adı", productNamePh: "örn. Keratin Şampuan...",
    description: "Açıklama", descPh: "İsteğe bağlı açıklama...", barcode: "Barkod", price: "Fiyat", stockQty: "Stok Adedi", save: "Kaydet", saving: "Kaydediliyor...",
    saleDetailTitle: "Satış Detayı", seller: "Satıcı", saleDate: "Tarih", delete: "Sil", confirmDelete: "Bu kaydı silmek istiyor musunuz?", edit: "Düzenle",
    productCol: "Ürün", customerCol: "Müşteri", qtyCol: "Adet", amountCol: "Tutar", methodCol: "Yöntem", dateCol: "Tarih", priceCol: "Fiyat", stockCol: "Stok", allStaff: "Tüm Personel",
  },
};

/* ═══ HELPERS ═══ */
const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) => n.toLocaleString("tr-TR");
const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (d: string) => new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

function MethodBadge({ display, language }: { display: string; language: "en" | "tr" }) {
  const color = METHOD_COLORS[display] || "#8b5cf6";
  const method = PAYMENT_METHODS.find(m => display.includes(m.en) || display.includes(m.tr));
  const label = method ? (language === "tr" ? method.tr : method.en) : display;
  return (<span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium border" style={{ backgroundColor: `${color}12`, color, borderColor: `${color}30` }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>);
}

function StatCard({ label, value, sub, color, isDark }: { label: string; value: string; sub?: string; color: string; isDark: boolean }) {
  return (<div className={`rounded-xl border border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-4 py-3`}><p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p><p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>{sub && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{sub}</p>}</div>);
}

/* ═══ MAIN ═══ */
export default function ProductSalesScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  const [sales, setSales] = useState<ProductSaleListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tab, setTab] = useState<TabMode>("sales");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffFilter, setStaffFilter] = useState<number | "">("");

  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleForm, setSaleForm] = useState({ productId: 0, customerId: null as number | null, quantity: 1, currencyId: 0, exchangeRateToTry: 1, paymentMethod: "Cash", notes: "" });
  const [saleSaving, setSaleSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDd, setShowCustomerDd] = useState(false);
  const customerDdRef = useRef<HTMLDivElement>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormMode, setProductFormMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", barcode: "", price: 0, stockQuantity: 0 });
  const [productSaving, setProductSaving] = useState(false);

  const [selectedSale, setSelectedSale] = useState<ProductSaleListItem | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffFilter) params.staffId = staffFilter;
      params.pageNumber = page;
      params.pageSize = pageSize;
      const res = await productService.listSalesPaginated(params as any);
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setSales(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const params: Record<string, string | number> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (staffFilter) params.staffId = staffFilter;
        const res = await productService.listSales(Object.keys(params).length > 0 ? params as any : undefined);
        if (res.data.success && res.data.data) { setSales(res.data.data); setTotalCount(res.data.data.length); setTotalPages(1); }
      } catch { /* */ }
    } finally { setLoading(false); }
  }, [startDate, endDate, staffFilter, page, pageSize]);

  const fetchProducts = useCallback(async () => {
    try { const res = await productService.list(); if (res.data.success && res.data.data) setProducts(res.data.data); } catch { toast.error(language === "tr" ? "Ürünler yüklenemedi" : "Failed to load products"); }
  }, [language]);

  const fetchRef = useCallback(async () => {
    const [a, b, c] = await Promise.allSettled([customerService.list(), currencyService.list(), staffService.list()]);
    if (a.status === "fulfilled" && a.value.data.success && a.value.data.data) setCustomers(a.value.data.data);
    if (b.status === "fulfilled" && b.value.data.success && b.value.data.data) setCurrencies(b.value.data.data);
    if (c.status === "fulfilled" && c.value.data.success && c.value.data.data) setStaffList(c.value.data.data);
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);
  useEffect(() => { fetchProducts(); fetchRef(); }, [fetchProducts, fetchRef]);
  useEffect(() => { const h = (e: MouseEvent) => { if (customerDdRef.current && !customerDdRef.current.contains(e.target as Node)) setShowCustomerDd(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  const filteredSales = sales.filter(s => { if (!search) return true; const q = search.toLowerCase(); return s.productName.toLowerCase().includes(q) || s.customerFullName?.toLowerCase().includes(q) || s.staffFullName.toLowerCase().includes(q); });
  const filteredProducts = products.filter(p => { if (!search) return true; return p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search); });
  const totalRevenue = filteredSales.reduce((s, x) => s + x.amountInTry, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;

  const openSaleForm = () => { const dc = currencies.find(c => c.isDefault) || currencies[0]; setSaleForm({ productId: 0, customerId: null, quantity: 1, currencyId: dc?.id || 0, exchangeRateToTry: dc?.exchangeRateToTry || 1, paymentMethod: "Cash", notes: "" }); setCustomerSearch(""); setShowSaleForm(true); };
  const handleSaleSubmit = async (e: FormEvent) => { e.preventDefault(); if (!saleForm.productId) { toast.error(language === "tr" ? "Ürün seçimi zorunludur" : "Product is required"); return; } setSaleSaving(true); try { await productService.createSale({ productId: saleForm.productId, customerId: saleForm.customerId || undefined, quantity: saleForm.quantity, currencyId: saleForm.currencyId || undefined, exchangeRateToTry: saleForm.exchangeRateToTry, paymentMethod: saleForm.paymentMethod, notes: saleForm.notes || undefined }); toast.success(language === "tr" ? "Satış kaydedildi" : "Sale recorded"); setShowSaleForm(false); fetchSales(); fetchProducts(); } catch { toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed"); } finally { setSaleSaving(false); } };
  const openProductCreate = () => { setProductForm({ name: "", description: "", barcode: "", price: 0, stockQuantity: 0 }); setEditingProductId(null); setProductFormMode("create"); setShowProductForm(true); };
  const openProductEdit = (p: ProductListItem) => { setProductForm({ name: p.name, description: p.description || "", barcode: p.barcode || "", price: p.price, stockQuantity: p.stockQuantity }); setEditingProductId(p.id); setProductFormMode("edit"); setShowProductForm(true); };
  const handleProductSubmit = async (e: FormEvent) => { e.preventDefault(); if (!productForm.name.trim()) { toast.error(language === "tr" ? "Ürün adı zorunludur" : "Product name is required"); return; } setProductSaving(true); try { const p = { name: productForm.name, description: productForm.description || undefined, barcode: productForm.barcode || undefined, price: productForm.price, stockQuantity: productForm.stockQuantity }; if (productFormMode === "edit" && editingProductId) { await productService.update(editingProductId, p); toast.success(language === "tr" ? "Ürün güncellendi" : "Product updated"); } else { await productService.create(p); toast.success(language === "tr" ? "Ürün oluşturuldu" : "Product created"); } setShowProductForm(false); fetchProducts(); } catch { toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed"); } finally { setProductSaving(false); } };
  const handleDeleteProduct = async (id: number) => { if (!confirm(t.confirmDelete)) return; try { await productService.delete(id); toast.success(language === "tr" ? "Ürün silindi" : "Product deleted"); fetchProducts(); } catch { toast.error(language === "tr" ? "Silme başarısız" : "Delete failed"); } };
  const handleDeleteSale = async (id: number) => { if (!confirm(t.confirmDelete)) return; try { await productService.deleteSale(id); toast.success(language === "tr" ? "Satış silindi" : "Sale deleted"); setShowSaleDetail(false); fetchSales(); fetchProducts(); } catch { toast.error(language === "tr" ? "Silme başarısız" : "Delete failed"); } };
  const handleCurrencyChange = (id: number) => { const c = currencies.find(x => x.id === id); setSaleForm({ ...saleForm, currencyId: id, exchangeRateToTry: c?.exchangeRateToTry || 1 }); };

  const selectedProduct = products.find(p => p.id === saleForm.productId);
  const filteredCust = customers.filter(c => { if (!customerSearch) return true; const q = customerSearch.toLowerCase(); return `${c.name} ${c.surname}`.toLowerCase().includes(q) || c.phone?.includes(q); });

  return (
    <div className={`space-y-5 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className={`mt-0.5 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>{tab === "sales" ? filteredSales.length : filteredProducts.length} {t.total}</p></div>
        <div className="flex items-center gap-3">
          {tab === "sales" && (
            <ExportButtons
              data={filteredSales as unknown as Record<string, unknown>[]}
              columns={((): ExportColumn[] => {
                const isTr = language === "tr";
                return [
                  { header: isTr ? "Ürün" : "Product", key: "productName" },
                  { header: isTr ? "Müşteri" : "Customer", key: "customerFullName" },
                  { header: isTr ? "Personel" : "Staff", key: "staffFullName" },
                  { header: isTr ? "Adet" : "Qty", key: "quantity", format: "number" },
                  { header: isTr ? "Birim Fiyat" : "Unit Price", key: "unitPrice", format: "currency" },
                  { header: isTr ? "Toplam" : "Total", key: "amountInTry", format: "currency" },
                  { header: isTr ? "Yöntem" : "Method", key: "paymentMethodDisplay" },
                  { header: isTr ? "Tarih" : "Date", key: "saleDate", format: "datetime" },
                ];
              })()}
              filenamePrefix={language === "tr" ? "Ürün_Satışları" : "Product_Sales"}
              pdfTitle={language === "tr" ? "Ürün Satış Listesi" : "Product Sales List"}
            />
          )}
          {tab === "products" && <button onClick={openProductCreate} className={`flex items-center gap-2 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-4 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} active:scale-[0.98]`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{t.newProduct}</button>}
          <button onClick={openSaleForm} className={`group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-5 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition-all hover:shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>{t.newSale}</button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.totalRevenue} value={`₺${fmt(totalRevenue)}`} color="#22c55e" isDark={isDark} />
        <StatCard label={t.totalSales} value={fmtInt(sales.length)} color="#6366f1" isDark={isDark} />
        <StatCard label={t.totalProducts} value={fmtInt(products.length)} color="#60a5fa" isDark={isDark} />
        <StatCard label={t.lowStock} value={fmtInt(lowStockCount)} sub="≤ 5" color={lowStockCount > 0 ? "#f59e0b" : "#22c55e"} isDark={isDark} />
      </div>

      {/* TABS + FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-1`}>
          {(["sales", "products"] as TabMode[]).map(m => (<button key={m} onClick={() => { setTab(m); setSearch(""); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${tab === m ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>{m === "sales" ? t.salesTab : t.productsTab}</button>))}
        </div>
        {tab === "sales" && (<>
          <LocaleDateInput value={startDate} onChange={e => setStartDate(e.target.value)} className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
          <span className="text-white/20">—</span>
          <LocaleDateInput value={endDate} onChange={e => setEndDate(e.target.value)} className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
          <select value={staffFilter} onChange={e => setStaffFilter(e.target.value === "" ? "" : Number(e.target.value))} className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}><option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{t.allStaff}</option>{staffList.filter(s => s.isActive).map(s => <option key={s.id} value={s.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{s.name} {s.surname}</option>)}</select>
        </>)}
        <div className="relative ml-auto"><svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className={`rounded-xl border border-white/[0.08] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-1.5 pl-11 pr-3 text-xs ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none w-48`} /></div>
      </div>

      {/* SALES TAB */}
      {tab === "sales" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {loading ? (<div className={`flex items-center justify-center gap-3 p-12 ${isDark ? "text-white/40" : "text-gray-400"}`}><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />{t.loading}</div>
          ) : filteredSales.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2 p-12"><svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg><p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noSales}</p><p className="text-xs text-white/25">{t.noSalesSub}</p></div>
          ) : (<>
            <div className={`hidden md:grid grid-cols-[1fr_0.8fr_0.4fr_0.6fr_0.6fr_0.5fr_auto] gap-4 border-b border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}><span>{t.productCol}</span><span>{t.customerCol}</span><span>{t.qtyCol}</span><span>{t.amountCol}</span><span>{t.methodCol}</span><span>{t.dateCol}</span><span /></div>
            <div className="divide-y divide-white/[0.04]">
              {filteredSales.map(s => (
                <div key={s.id} onClick={() => { setSelectedSale(s); setShowSaleDetail(true); }} className="group grid grid-cols-1 md:grid-cols-[1fr_0.8fr_0.4fr_0.6fr_0.6fr_0.5fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer">
                  <div className="min-w-0"><p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{s.productName}</p><p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{s.staffFullName}</p></div>
                  <p className={`hidden md:block text-xs ${isDark ? "text-white/50" : "text-gray-500"} truncate`}>{s.customerFullName || "—"}</p>
                  <p className={`hidden md:block text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{s.quantity}x</p>
                  <div><p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{s.currencySymbol}{fmt(s.totalAmount)}</p>{s.currencyCode !== "TRY" && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>₺{fmt(s.amountInTry)}</p>}</div>
                  <MethodBadge display={s.paymentMethodDisplay} language={language} />
                  <p className={`hidden md:block text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{formatDate(s.saleDate)}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}><button onClick={() => handleDeleteSale(s.id)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition hover:bg-red-500/20 hover:text-red-400`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button></div>
                </div>
              ))}
            </div>
            <Pagination pageNumber={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} onPageChange={(p) => setPage(p)} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            <div className={`flex items-center justify-between border-t border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-3`}><span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{filteredSales.length} {t.total}</span><span className="text-sm font-bold text-emerald-400">₺{fmt(totalRevenue)}</span></div>
          </>)}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {products.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2 p-12"><svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg><p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noProducts}</p><p className="text-xs text-white/25">{t.noProductsSub}</p></div>
          ) : (<>
            <div className={`hidden md:grid grid-cols-[1fr_0.5fr_0.5fr_auto] gap-4 border-b border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-2.5 text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}><span>{t.productCol}</span><span>{t.priceCol}</span><span>{t.stockCol}</span><span /></div>
            <div className="divide-y divide-white/[0.04]">
              {filteredProducts.map(p => (
                <div key={p.id} className="group grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_auto] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04]">
                  <div className="min-w-0"><p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{p.name}</p>{p.description && <p className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-300"} truncate`}>{p.description}</p>}{p.barcode && <p className="text-[10px] text-white/20 font-mono">{p.barcode}</p>}</div>
                  <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>₺{fmt(p.price)}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold w-fit ${p.stockQuantity <= 5 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>{p.stockQuantity} {t.pcs}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openProductEdit(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} hover:text-white`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/30" : "text-gray-300"} transition hover:bg-red-500/20 hover:text-red-400`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
            <div className={`border-t border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} px-5 py-3 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{filteredProducts.length} {t.total}</div>
          </>)}
        </div>
      )}

      {/* SALE CREATE MODAL */}
      <Modal open={showSaleForm} onClose={() => setShowSaleForm(false)} title={t.createSaleTitle} maxWidth="max-w-xl">
        <form onSubmit={handleSaleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.product}</label>
            <div className={`space-y-1.5 max-h-40 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} p-2`}>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{language === "tr" ? "Ürün bulunamadı" : "No products found"}</p>
                  <p className="mt-1 text-[10px] text-white/25">{language === "tr" ? "Önce \"Ürünler\" sayfasından ürün ekleyin" : "Add products from the \"Products\" page first"}</p>
                </div>
              ) : (
                products.map(p => (<button key={p.id} type="button" onClick={() => setSaleForm({ ...saleForm, productId: p.id })} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${saleForm.productId === p.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"}`}><div><p className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{p.name}</p><p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>₺{fmt(p.price)} • {p.stockQuantity} {t.pcs}</p></div>{saleForm.productId === p.id && <svg className="shrink-0 text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</button>))
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.customer}</label>
              <div className="relative" ref={customerDdRef}>
                <input type="text" value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDd(true); }} onFocus={() => setShowCustomerDd(true)} placeholder={t.searchCustomer} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`} />
                {showCustomerDd && (<div className={`absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#1a1a2e]" : "bg-white"} shadow-xl`}>
                  <button type="button" onClick={() => { setSaleForm({ ...saleForm, customerId: null }); setCustomerSearch(""); setShowCustomerDd(false); }} className={`flex w-full px-3 py-2 text-xs ${isDark ? "text-white/40" : "text-gray-400"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>— {language === "tr" ? "Müşteri yok" : "No customer"}</button>
                  {filteredCust.map(c => (<button key={c.id} type="button" onClick={() => { setSaleForm({ ...saleForm, customerId: c.id }); setCustomerSearch(`${c.name} ${c.surname}`); setShowCustomerDd(false); }} className={`flex w-full px-3 py-2 text-xs ${isDark ? "text-white" : "text-gray-900"} text-left ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{c.name} {c.surname}</button>))}
                </div>)}
              </div>
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.quantity}</label>
              <input type="number" min={1} value={saleForm.quantity} onChange={e => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/25`} />
              {selectedProduct && <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.totalAmount}: ₺{fmt(selectedProduct.price * saleForm.quantity)}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.currency}</label><select value={saleForm.currencyId} onChange={e => handleCurrencyChange(Number(e.target.value))} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}>{currencies.map(c => <option key={c.id} value={c.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{c.symbol} {c.code}</option>)}</select></div>
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.exchangeRate}</label><input type="number" min={0} step={0.0001} value={saleForm.exchangeRateToTry} onChange={e => setSaleForm({ ...saleForm, exchangeRateToTry: Number(e.target.value) })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} /></div>
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.paymentMethod}</label><select value={saleForm.paymentMethod} onChange={e => setSaleForm({ ...saleForm, paymentMethod: e.target.value })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}>{PAYMENT_METHODS.map(m => <option key={m.value} value={m.value} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{language === "tr" ? m.tr : m.en}</option>)}</select></div>
          </div>
          <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.notes}</label><input type="text" value={saleForm.notes} onChange={e => setSaleForm({ ...saleForm, notes: e.target.value })} placeholder={t.notesPlaceholder} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`} /></div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saleSaving} className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition disabled:opacity-50`}>{saleSaving ? t.recording : t.recordSale}</button>
            <button type="button" onClick={() => setShowSaleForm(false)} className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{t.cancel}</button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT CREATE/EDIT MODAL */}
      <Modal open={showProductForm} onClose={() => setShowProductForm(false)} title={productFormMode === "create" ? t.createProductTitle : t.editProductTitle} maxWidth="max-w-md">
        <form onSubmit={handleProductSubmit} className="space-y-5">
          <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.productName}</label><input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder={t.productNamePh} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`} /></div>
          <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.description}</label><input type="text" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder={t.descPh} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:outline-none focus:border-white/25`} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.barcode}</label><input type="text" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none font-mono`} /></div>
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.price}</label><div className="relative"><span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-gray-300"}`}>₺</span><input type="number" min={0} step={0.01} value={productForm.price || ""} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} py-2.5 pl-8 pr-3 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} /></div></div>
            <div className="space-y-2"><label className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.stockQty}</label><input type="number" min={0} value={productForm.stockQuantity} onChange={e => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })} className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={productSaving} className={`flex-1 rounded-xl bg-gradient-to-r from-[#00a651] to-[#00c853] px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/30 transition disabled:opacity-50`}>{productSaving ? t.saving : t.save}</button>
            <button type="button" onClick={() => setShowProductForm(false)} className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-6 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{t.cancel}</button>
          </div>
        </form>
      </Modal>

      {/* SALE DETAIL MODAL */}
      <Modal open={showSaleDetail} onClose={() => setShowSaleDetail(false)} title={t.saleDetailTitle} maxWidth="max-w-md">
        {selectedSale && (() => { const s = selectedSale; return (
          <div className="space-y-5">
            <div className={`flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] ${isDark ? "bg-white/[0.03]" : "bg-gray-50/50"} py-5`}><p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{s.currencySymbol}{fmt(s.totalAmount)}</p>{s.currencyCode !== "TRY" && <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>₺{fmt(s.amountInTry)}</p>}<MethodBadge display={s.paymentMethodDisplay} language={language} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.productCol}</p><p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{s.productName}</p></div>
              <div className="space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.qtyCol}</p><p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{s.quantity}x @ ₺{fmt(s.unitPrice)}</p></div>
              <div className="space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.customerCol}</p><p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{s.customerFullName || "—"}</p></div>
              <div className="space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.seller}</p><p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{s.staffFullName}</p></div>
              <div className="space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.saleDate}</p><p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(s.saleDate)} {formatTime(s.saleDate)}</p></div>
              {s.notes && <div className="col-span-2 space-y-1"><p className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-white/30" : "text-gray-300"}`}>{t.notes}</p><p className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>{s.notes}</p></div>}
            </div>
            <button onClick={() => handleDeleteSale(s.id)} className="w-full rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-500/20 transition hover:bg-red-500/20">{t.delete}</button>
          </div>
        ); })()}
      </Modal>
    </div>
  );
}

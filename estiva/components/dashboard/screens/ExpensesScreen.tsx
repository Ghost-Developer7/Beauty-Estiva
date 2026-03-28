"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { expenseService } from "@/services/expenseService";
import { currencyService } from "@/services/currencyService";
import { expenseSchema, getValidationMessage } from "@/lib/validations";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import type { ExpenseItem, ExpenseCategoryItem, CurrencyItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExportButtons from "@/components/ui/ExportButtons";
import type { ExportColumn } from "@/lib/exportUtils";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Expenses",
    new: "New",
    newCategory: "New Category",
    headers: ["Category", "Description", "Amount", "Date", "Receipt #", "Notes", ""],
    recordCount: "Total",
    loading: "Loading...",
    noData: "No expenses found.",
    tabs: ["Expense List", "Categories"],
    modalCreate: "New Expense",
    modalEdit: "Edit Expense",
    modalCategory: "New Category",
    category: "Category",
    amount: "Amount",
    currency: "Currency",
    description: "Description",
    expenseDate: "Date",
    receiptNumber: "Receipt #",
    notes: "Notes",
    categoryName: "Category Name",
    categoryDesc: "Description",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    deleteConfirm: "Delete this expense?",
    deleteCatConfirm: "Delete this category?",
    selectCategory: "Select category...",
    totalAmount: "Total Amount",
    startDate: "Start Date",
    endDate: "End Date",
    filter: "Filter",
  },
  tr: {
    title: "Masraflar",
    new: "Yeni",
    newCategory: "Yeni Kategori",
    headers: ["Kategori", "Açıklama", "Tutar", "Tarih", "Fiş No", "Notlar", ""],
    recordCount: "Toplam",
    loading: "Yükleniyor...",
    noData: "Masraf bulunamadı.",
    tabs: ["Masraf Listesi", "Kategoriler"],
    modalCreate: "Yeni Masraf",
    modalEdit: "Masraf Düzenle",
    modalCategory: "Yeni Kategori",
    category: "Kategori",
    amount: "Tutar",
    currency: "Para Birimi",
    description: "Açıklama",
    expenseDate: "Tarih",
    receiptNumber: "Fiş No",
    notes: "Notlar",
    categoryName: "Kategori Adı",
    categoryDesc: "Açıklama",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    deleteConfirm: "Bu masrafı silmek istiyor musunuz?",
    deleteCatConfirm: "Bu kategoriyi silmek istiyor musunuz?",
    selectCategory: "Kategori seçin...",
    totalAmount: "Toplam Tutar",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    filter: "Filtrele",
  },
};

export default function ExpensesScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];
  const [activeTab, setActiveTab] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [catFilter, setCatFilter] = useState<number | "">("");

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseMode, setExpenseMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expForm, setExpForm] = useState({
    categoryId: 0, amount: 0, currencyId: 0, description: "", expenseDate: "", receiptNumber: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params: { startDate?: string; endDate?: string; categoryId?: number; pageNumber?: number; pageSize?: number } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (catFilter !== "") params.categoryId = catFilter as number;
      params.pageNumber = page;
      params.pageSize = pageSize;
      const res = await expenseService.listPaginated(Object.keys(params).length > 0 ? params : undefined);
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setExpenses(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const params: { startDate?: string; endDate?: string; categoryId?: number } = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (catFilter !== "") params.categoryId = catFilter as number;
        const res = await expenseService.list(Object.keys(params).length > 0 ? params : undefined);
        if (res.data.success && res.data.data) {
          setExpenses(res.data.data);
          setTotalCount(res.data.data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(language === "tr" ? "Masraflar yüklenemedi" : "Failed to load expenses");
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, catFilter, page, pageSize, language]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await expenseService.listCategories();
      if (res.data.success && res.data.data) setCategories(res.data.data);
    } catch { /* silent */ }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await currencyService.list();
      if (res.data.success && res.data.data) setCurrencies(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { fetchCategories(); fetchCurrencies(); }, [fetchCategories, fetchCurrencies]);

  const openCreateExpense = () => {
    setExpForm({
      categoryId: categories[0]?.id || 0,
      amount: 0,
      currencyId: currencies.find((c) => c.isDefault)?.id || currencies[0]?.id || 0,
      description: "", expenseDate: new Date().toISOString().split("T")[0], receiptNumber: "", notes: "",
    });
    setEditingId(null);
    setExpenseMode("create");
    setShowExpenseModal(true);
  };

  const openEditExpense = (item: ExpenseItem) => {
    setExpForm({
      categoryId: item.categoryId,
      amount: item.amount,
      currencyId: currencies.find((c) => c.code === item.currencyCode)?.id || 0,
      description: item.description || "",
      expenseDate: item.expenseDate.split("T")[0],
      receiptNumber: item.receiptNumber || "",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setExpenseMode("edit");
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = expenseSchema.safeParse(expForm);
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
        categoryId: expForm.categoryId,
        amount: expForm.amount,
        currencyId: expForm.currencyId,
        description: expForm.description || undefined,
        expenseDate: expForm.expenseDate,
        receiptNumber: expForm.receiptNumber || undefined,
        notes: expForm.notes || undefined,
      };
      if (expenseMode === "edit" && editingId) {
        await expenseService.update(editingId, payload);
        toast.success(language === "tr" ? "Masraf güncellendi" : "Expense updated");
      } else {
        await expenseService.create(payload);
        toast.success(language === "tr" ? "Masraf oluşturuldu" : "Expense created");
      }
      setShowExpenseModal(false);
      fetchExpenses();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm(text.deleteConfirm)) return;
    try {
      await expenseService.delete(id);
      toast.success(language === "tr" ? "Masraf silindi" : "Expense deleted");
      fetchExpenses();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await expenseService.createCategory({ name: catForm.name, description: catForm.description || undefined });
      toast.success(language === "tr" ? "Kategori oluşturuldu" : "Category created");
      setShowCatModal(false);
      setCatForm({ name: "", description: "" });
      fetchCategories();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(text.deleteCatConfirm)) return;
    try {
      await expenseService.deleteCategory(id);
      toast.success(language === "tr" ? "Kategori silindi" : "Category deleted");
      fetchCategories();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amountInTry, 0);
  const formatCurrency = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const formatDate = (d: string) => new Date(d).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <div className="flex items-center gap-3">
          <ExportButtons
            data={expenses as unknown as Record<string, unknown>[]}
            columns={((): ExportColumn[] => {
              const isTr = language === "tr";
              return [
                { header: isTr ? "Kategori" : "Category", key: "categoryName" },
                { header: isTr ? "Açıklama" : "Description", key: "description" },
                { header: isTr ? "Tutar" : "Amount", key: "amountInTry", format: "currency" },
                { header: isTr ? "Tarih" : "Date", key: "expenseDate", format: "date" },
                { header: isTr ? "Fiş No" : "Receipt #", key: "receiptNumber" },
                { header: isTr ? "Notlar" : "Notes", key: "notes" },
              ];
            })()}
            filenamePrefix={language === "tr" ? "Masraflar" : "Expenses"}
            pdfTitle={language === "tr" ? "Masraf Listesi" : "Expenses List"}
          />
          <button onClick={() => { setCatForm({ name: "", description: "" }); setShowCatModal(true); }}
            className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-1.5 text-xs font-medium ${isDark ? "text-white/70" : "text-gray-700"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
            + {text.newCategory}
          </button>
          <button onClick={openCreateExpense}
            className={`flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/20 hover:bg-[#008f45]`}>
            + {text.new}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-3`}>
        <LocaleDateInput value={startDate} onChange={(e) => setStartDate(e.target.value)}
          className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} bg-transparent px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
        <LocaleDateInput value={endDate} onChange={(e) => setEndDate(e.target.value)}
          className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} bg-transparent px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`} isDark={isDark} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value === "" ? "" : Number(e.target.value))}
          className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} bg-transparent px-3 py-1.5 text-xs ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}>
          <option value="" className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{text.selectCategory}</option>
          {categories.map((c) => <option key={c.id} value={c.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{c.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
        {text.tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === i ? (isDark ? "border-white text-white" : "border-gray-900 text-gray-900") : (isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-600")}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        /* Expense List */
        <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          {loading ? (
            <div className={`p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.loading}</div>
          ) : expenses.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.noData}</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[10px] md:text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  {text.headers.map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                {expenses.map((exp) => (
                  <tr key={exp.id} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 ${isDark ? "text-white/80" : "text-gray-800"}`}>{exp.categoryName}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"} max-w-[200px] truncate`}>{exp.description || "—"}</td>
                    <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatCurrency(exp.amount)} {exp.currencySymbol}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{formatDate(exp.expenseDate)}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{exp.receiptNumber || "—"}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"} max-w-[150px] truncate`}>{exp.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditExpense(exp)}
                          className={`flex h-7 w-7 items-center justify-center rounded bg-[#f59e0b] ${isDark ? "text-white" : "text-gray-900"} shadow hover:bg-[#d97706]`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteExpense(exp.id)}
                          className={`flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] ${isDark ? "text-white" : "text-gray-900"} shadow hover:bg-[#dc2626]`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <Pagination
            pageNumber={page}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
          <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-3 flex justify-between text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>
            <span>{text.recordCount}: {totalCount}</span>
            <span>{text.totalAmount}: {formatCurrency(totalAmount)} ₺</span>
          </div>
        </div>
      ) : (
        /* Categories */
        <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          {categories.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.noData}</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <th className="px-4 py-3">{text.categoryName}</th>
                  <th className="px-4 py-3">{text.categoryDesc}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                {categories.map((cat) => (
                  <tr key={cat.id} className={`transition ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{cat.name}</td>
                    <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{cat.description || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteCategory(cat.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] ${isDark ? "text-white" : "text-gray-900"} shadow hover:bg-[#dc2626]`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expense Modal */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)}
        title={expenseMode === "create" ? text.modalCreate : text.modalEdit}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.category} *</label>
              <select value={expForm.categoryId} onChange={(e) => setExpForm({ ...expForm, categoryId: Number(e.target.value) })}
                className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors.categoryId ? "border-red-500" : (isDark ? "border-white/10 focus:border-white/30" : "border-gray-200 focus:border-gray-400")}`}>
                <option value={0} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{text.selectCategory}</option>
                {categories.map((c) => <option key={c.id} value={c.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{c.name}</option>)}
              </select>
              {fieldErrors.categoryId && <p className="text-xs text-red-500">{fieldErrors.categoryId}</p>}
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.expenseDate} *</label>
              <LocaleDateInput value={expForm.expenseDate} onChange={(e) => setExpForm({ ...expForm, expenseDate: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors.expenseDate ? "border-red-500" : (isDark ? "border-white/10 focus:border-white/30" : "border-gray-200 focus:border-gray-400")}`} isDark={isDark} />
              {fieldErrors.expenseDate && <p className="text-xs text-red-500">{fieldErrors.expenseDate}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.amount} *</label>
              <input type="number" min={0} step={0.01} value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                className={`w-full rounded-xl border ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none ${fieldErrors.amount ? "border-red-500" : (isDark ? "border-white/10 focus:border-white/30" : "border-gray-200 focus:border-gray-400")}`} />
              {fieldErrors.amount && <p className="text-xs text-red-500">{fieldErrors.amount}</p>}
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.currency}</label>
              <select value={expForm.currencyId} onChange={(e) => setExpForm({ ...expForm, currencyId: Number(e.target.value) })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`}>
                {currencies.map((c) => <option key={c.id} value={c.id} className={`${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}>{c.code} ({c.symbol})</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.description}</label>
            <input type="text" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.receiptNumber}</label>
              <input type="text" value={expForm.receiptNumber} onChange={(e) => setExpForm({ ...expForm, receiptNumber: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`} />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.notes}</label>
              <input type="text" value={expForm.notes} onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className={`flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} hover:bg-[#008f45] disabled:opacity-50`}>
              {saving ? text.saving : text.save}
            </button>
            <button type="button" onClick={() => setShowExpenseModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
              {text.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title={text.modalCategory} maxWidth="max-w-sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.categoryName} *</label>
            <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`} />
          </div>
          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{text.categoryDesc}</label>
            <input type="text" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "focus:border-white/30" : "focus:border-gray-400"} focus:outline-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={`flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} hover:bg-[#008f45]`}>{text.save}</button>
            <button type="button" onClick={() => setShowCatModal(false)} className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>{text.cancel}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

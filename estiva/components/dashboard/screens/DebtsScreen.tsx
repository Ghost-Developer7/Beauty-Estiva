"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { debtService } from "@/services/debtService";
import { customerService } from "@/services/customerService";
import type { CustomerDebtItem, CustomerListItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PartiallyPaid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Paid: "bg-green-500/20 text-green-400 border-green-500/30",
  Overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const copy = {
  en: {
    title: "Debts",
    newButton: "New Debt",
    placeholder: "Search by name or description...",
    loading: "Loading...",
    noData: "No debts found.",
    cols: ["Person", "Amount", "Paid", "Remaining", "Due Date", "Status", "Source", "Created", ""],
    totalAmount: "Total",
    paidAmount: "Paid",
    remainingAmount: "Remaining",
    all: "All",
    pending: "Pending",
    partiallyPaid: "Partially Paid",
    paid: "Paid",
    overdue: "Overdue",
    modal: {
      createTitle: "New Debt",
      editTitle: "Edit Debt",
      customer: "Customer",
      selectCustomer: "Select customer (optional)...",
      person: "Person Name",
      personPh: "Enter person name",
      amount: "Amount",
      amountPh: "0.00",
      currency: "Currency",
      description: "Description",
      descriptionPh: "Debt description...",
      dueDate: "Due Date",
      notes: "Notes",
      notesPh: "Optional notes...",
      source: "Source",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      success: "Debt saved successfully.",
      error: "Failed to save debt.",
      deleteConfirm: "Delete this debt?",
      deleteSuccess: "Debt deleted.",
      deleteError: "Failed to delete debt.",
      amountRequired: "Amount is required.",
      personRequired: "Person name or customer is required.",
    },
    payment: {
      title: "Add Payment",
      amount: "Payment Amount",
      amountPh: "0.00",
      method: "Payment Method",
      date: "Payment Date",
      notes: "Notes",
      notesPh: "Optional notes...",
      save: "Save Payment",
      saving: "Saving...",
      cancel: "Cancel",
      success: "Payment recorded.",
      error: "Failed to record payment.",
      remaining: "Remaining",
    },
    sources: { Manual: "Manual", Appointment: "Appointment", PackageSale: "Package", Product: "Product" },
    methods: { Cash: "Cash", Card: "Card", BankTransfer: "Bank Transfer", Other: "Other" },
    statusLabels: { Pending: "Pending", PartiallyPaid: "Partially Paid", Paid: "Paid", Overdue: "Overdue", Cancelled: "Cancelled" },
  },
  tr: {
    title: "Borçlar",
    newButton: "Yeni Borç",
    placeholder: "Ad veya açıklama ile ara...",
    loading: "Yükleniyor...",
    noData: "Borç bulunamadı.",
    cols: ["Kişi", "Tutar", "Ödenen", "Kalan", "Vade Tarihi", "Durum", "Kaynak", "Oluşturulma", ""],
    totalAmount: "Toplam",
    paidAmount: "Ödenen",
    remainingAmount: "Kalan",
    all: "Tümünü",
    pending: "Bekleyen",
    partiallyPaid: "Kısmi Ödenmiş",
    paid: "Ödenmiş",
    overdue: "Vadesi Geçmiş",
    modal: {
      createTitle: "Yeni Borç",
      editTitle: "Borç Düzenle",
      customer: "Müşteri",
      selectCustomer: "Müşteri seçin (isteğe bağlı)...",
      person: "Kişi Adı",
      personPh: "Kişi adı girin",
      amount: "Tutar",
      amountPh: "0.00",
      currency: "Para Birimi",
      description: "Açıklama",
      descriptionPh: "Borç açıklaması...",
      dueDate: "Vade Tarihi",
      notes: "Notlar",
      notesPh: "İsteğe bağlı notlar...",
      source: "Kaynak",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      cancel: "İptal",
      success: "Borç başarıyla kaydedildi.",
      error: "Borç kaydedilemedi.",
      deleteConfirm: "Bu borcu silmek istiyor musunuz?",
      deleteSuccess: "Borç silindi.",
      deleteError: "Borç silinemedi.",
      amountRequired: "Tutar zorunludur.",
      personRequired: "Kişi adı veya müşteri seçilmelidir.",
    },
    payment: {
      title: "Ödeme Ekle",
      amount: "Ödeme Tutarı",
      amountPh: "0.00",
      method: "Ödeme Yöntemi",
      date: "Ödeme Tarihi",
      notes: "Notlar",
      notesPh: "İsteğe bağlı notlar...",
      save: "Ödemeyi Kaydet",
      saving: "Kaydediliyor...",
      cancel: "İptal",
      success: "Ödeme kaydedildi.",
      error: "Ödeme kaydedilemedi.",
      remaining: "Kalan",
    },
    sources: { Manual: "Manuel", Appointment: "Randevu", PackageSale: "Paket", Product: "Ürün" },
    methods: { Cash: "Nakit", Card: "Kart", BankTransfer: "Havale/EFT", Other: "Diğer" },
    statusLabels: { Pending: "Bekleyen", PartiallyPaid: "Kısmi Ödenmiş", Paid: "Ödenmiş", Overdue: "Vadesi Geçmiş", Cancelled: "İptal" },
  },
};

const EMPTY_FORM = {
  customerId: "" as string,
  personName: "",
  amount: "",
  currency: "TRY",
  description: "",
  dueDate: "",
  notes: "",
  source: "Manual",
};

const EMPTY_PAYMENT = {
  amount: "",
  paymentMethod: "Cash",
  notes: "",
  paymentDate: "",
};

export default function DebtsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  // Data
  const [debts, setDebts] = useState<CustomerDebtItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Summary
  const [summary, setSummary] = useState({ totalAmount: 0, totalPaid: 0, totalRemaining: 0 });

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<CustomerDebtItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<CustomerDebtItem | null>(null);
  const [paymentForm, setPaymentForm] = useState({ ...EMPTY_PAYMENT });
  const [paymentSaving, setPaymentSaving] = useState(false);

  // ─── Fetch ───

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await debtService.list({
        type: "Debt",
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        pageSize,
      });
      const data = res.data.data;
      if (data) {
        setDebts(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error(t.modal.error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, t.modal.error]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await debtService.getSummary("Debt");
      if (res.data.data) {
        setSummary({
          totalAmount: res.data.data.totalAmount,
          totalPaid: res.data.data.totalPaid,
          totalRemaining: res.data.data.totalRemaining,
        });
      }
    } catch { /* silent */ }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerService.list();
      if (res.data.data) setCustomers(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ─── Handlers ───

  const resetForm = () => setForm({ ...EMPTY_FORM });

  const openCreate = () => {
    resetForm();
    setEditingDebt(null);
    setShowModal(true);
  };

  const openEdit = (debt: CustomerDebtItem) => {
    setEditingDebt(debt);
    setForm({
      customerId: debt.customerId?.toString() || "",
      personName: debt.personName || "",
      amount: debt.amount.toString(),
      currency: debt.currency || "TRY",
      description: debt.description || "",
      dueDate: debt.dueDate ? debt.dueDate.split("T")[0] : "",
      notes: debt.notes || "",
      source: debt.source || "Manual",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error(t.modal.amountRequired);
      return;
    }
    if (!form.customerId && !form.personName.trim()) {
      toast.error(t.modal.personRequired);
      return;
    }
    setSaving(true);
    try {
      if (editingDebt) {
        await debtService.update(editingDebt.id, {
          customerId: form.customerId ? Number(form.customerId) : null,
          personName: form.personName || null,
          amount: Number(form.amount),
          currency: form.currency,
          description: form.description,
          notes: form.notes,
          dueDate: form.dueDate || null,
          source: form.source,
        });
      } else {
        await debtService.create({
          customerId: form.customerId ? Number(form.customerId) : null,
          personName: form.personName || null,
          type: "Debt",
          amount: Number(form.amount),
          currency: form.currency,
          description: form.description,
          notes: form.notes,
          dueDate: form.dueDate || null,
          source: form.source,
        });
      }
      toast.success(t.modal.success);
      setShowModal(false);
      resetForm();
      fetchDebts();
      fetchSummary();
    } catch {
      toast.error(t.modal.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.modal.deleteConfirm)) return;
    try {
      await debtService.delete(id);
      toast.success(t.modal.deleteSuccess);
      fetchDebts();
      fetchSummary();
    } catch {
      toast.error(t.modal.deleteError);
    }
  };

  const openPayment = (debt: CustomerDebtItem) => {
    setPaymentTarget(debt);
    setPaymentForm({ ...EMPTY_PAYMENT });
    setShowPaymentModal(true);
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentTarget) return;
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error(t.modal.amountRequired);
      return;
    }
    setPaymentSaving(true);
    try {
      await debtService.addPayment(paymentTarget.id, {
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes || undefined,
        paymentDate: paymentForm.paymentDate || null,
      });
      toast.success(t.payment.success);
      setShowPaymentModal(false);
      fetchDebts();
      fetchSummary();
    } catch {
      toast.error(t.payment.error);
    } finally {
      setPaymentSaving(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US");
  };

  const getDisplayName = (debt: CustomerDebtItem) =>
    debt.customerName || debt.personName || "-";

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"} h-full flex flex-col`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <button
          onClick={openCreate}
          className={`flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"} shadow-lg hover:bg-green-500`}
        >
          <span className="text-lg leading-none">+</span> {t.newButton}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4`}>
          <div className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"} mb-1`}>{t.totalAmount}</div>
          <div className="text-xl font-bold">{formatCurrency(summary.totalAmount)}</div>
        </div>
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4`}>
          <div className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"} mb-1`}>{t.paidAmount}</div>
          <div className="text-xl font-bold text-green-400">{formatCurrency(summary.totalPaid)}</div>
        </div>
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4`}>
          <div className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"} mb-1`}>{t.remainingAmount}</div>
          <div className="text-xl font-bold text-red-400">{formatCurrency(summary.totalRemaining)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4 flex flex-wrap items-center justify-between gap-4`}>
        <input
          type="text"
          placeholder={t.placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className={`w-full md:w-64 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-4 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder-white/30" : "placeholder-gray-400"} focus:outline-none focus:border-white/20`}
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "", label: t.all },
            { value: "Pending", label: t.pending },
            { value: "PartiallyPaid", label: t.partiallyPaid },
            { value: "Paid", label: t.paid },
            { value: "Overdue", label: t.overdue },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === f.value
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`flex-1 rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
              <tr>
                {t.cols.map((col, i) => (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
              {loading ? (
                <tr>
                  <td colSpan={9} className={`px-4 py-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.loading}</td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan={9} className={`px-4 py-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noData}</td>
                </tr>
              ) : (
                debts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-white/[0.03] transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{getDisplayName(debt)}</div>
                      {debt.customerPhone && (
                        <div className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{debt.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{formatCurrency(debt.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-400">{formatCurrency(debt.paidAmount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-red-400">{formatCurrency(debt.remainingAmount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(debt.dueDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[debt.status] || ""}`}>
                        {t.statusLabels[debt.status as keyof typeof t.statusLabels] || debt.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      {t.sources[debt.source as keyof typeof t.sources] || debt.source}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? "text-white/40" : "text-gray-400"}`}>{formatDate(debt.cDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {debt.status !== "Paid" && debt.status !== "Cancelled" && (
                          <button
                            onClick={() => openPayment(debt)}
                            className="rounded-lg bg-green-600/20 px-2 py-1 text-[10px] font-medium text-green-400 hover:bg-green-600/30"
                          >
                            {language === "tr" ? "Ode" : "Pay"}
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(debt)}
                          className="rounded-lg bg-blue-600/20 px-2 py-1 text-[10px] font-medium text-blue-400 hover:bg-blue-600/30"
                        >
                          {language === "tr" ? "Düzenle" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="rounded-lg bg-red-600/20 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-600/30"
                        >
                          {language === "tr" ? "Sil" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          pageNumber={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingDebt ? t.modal.editTitle : t.modal.createTitle}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.customer}</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none`}
            >
              <option value="" className="bg-[#1a1a1a]">{t.modal.selectCustomer}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
                  {c.name} {c.surname} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.person}</label>
            <input
              type="text"
              value={form.personName}
              onChange={(e) => setForm({ ...form, personName: e.target.value })}
              placeholder={t.modal.personPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.amount} *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder={t.modal.amountPh}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.currency}</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none`}
              >
                {["TRY", "USD", "EUR", "GBP"].map((c) => (
                  <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.description}</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t.modal.descriptionPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.dueDate}</label>
              <LocaleDateInput
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none [color-scheme:dark]`}
                isDark={isDark}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.source}</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none`}
              >
                {Object.entries(t.sources).map(([val, label]) => (
                  <option key={val} value={val} className="bg-[#1a1a1a]">{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.modal.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder={t.modal.notesPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} hover:bg-[#008f45] disabled:opacity-50`}
            >
              {saving ? t.modal.saving : t.modal.save}
            </button>
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            >
              {t.modal.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={t.payment.title}
      >
        <form onSubmit={handlePayment} className="space-y-4">
          {paymentTarget && (
            <div className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-3 text-xs`}>
              <div className={`${isDark ? "text-white/50" : "text-gray-500"}`}>{getDisplayName(paymentTarget)}</div>
              <div className="mt-1 font-medium">
                {t.payment.remaining}: <span className="text-red-400">{formatCurrency(paymentTarget.remainingAmount)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.payment.amount} *</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              max={paymentTarget?.remainingAmount}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              placeholder={t.payment.amountPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.payment.method}</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none`}
              >
                {Object.entries(t.methods).map(([val, label]) => (
                  <option key={val} value={val} className="bg-[#1a1a1a]">{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.payment.date}</label>
              <LocaleDateInput
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:border-white/30 focus:outline-none [color-scheme:dark]`}
                isDark={isDark}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{t.payment.notes}</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2}
              placeholder={t.payment.notesPh}
              className={`w-full rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"} focus:border-white/30 focus:outline-none resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={paymentSaving}
              className={`flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} hover:bg-[#008f45] disabled:opacity-50`}
            >
              {paymentSaving ? t.payment.saving : t.payment.save}
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-2.5 text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
            >
              {t.payment.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

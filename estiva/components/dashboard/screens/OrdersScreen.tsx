"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentService } from "@/services/paymentService";
import { appointmentService } from "@/services/appointmentService";
import { currencyService } from "@/services/currencyService";
import type { AppointmentPaymentItem, AppointmentListItem, CurrencyItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const PAYMENT_METHODS = ["Cash", "CreditCard", "BankTransfer", "Check", "Other"];
const PAYMENT_METHOD_LABELS: Record<string, { en: string; tr: string }> = {
  Cash: { en: "Cash", tr: "Nakit" },
  CreditCard: { en: "Credit Card", tr: "Kredi Kartı" },
  BankTransfer: { en: "Bank Transfer", tr: "Havale" },
  Check: { en: "Check", tr: "Çek" },
  Other: { en: "Other", tr: "Diğer" },
};

const copy = {
  en: {
    title: "Payments",
    new: "New Payment",
    headers: ["Appointment", "Amount", "Currency", "Amount (TRY)", "Method", "Paid At", "Notes", ""],
    recordCount: "Total",
    loading: "Loading...",
    noData: "No payments found.",
    modalCreate: "Record Payment",
    appointment: "Appointment",
    amount: "Amount",
    currency: "Currency",
    paymentMethod: "Payment Method",
    notes: "Notes",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    deleteConfirm: "Delete this payment record?",
    selectAppointment: "Select appointment...",
    totalAmount: "Total",
  },
  tr: {
    title: "Ödemeler",
    new: "Yeni Ödeme",
    headers: ["Randevu", "Tutar", "Döviz", "Tutar (TRY)", "Yöntem", "Ödeme Tarihi", "Notlar", ""],
    recordCount: "Toplam",
    loading: "Yükleniyor...",
    noData: "Ödeme bulunamadı.",
    modalCreate: "Ödeme Kaydet",
    appointment: "Randevu",
    amount: "Tutar",
    currency: "Para Birimi",
    paymentMethod: "Ödeme Yöntemi",
    notes: "Notlar",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    deleteConfirm: "Bu ödeme kaydını silmek istiyor musunuz?",
    selectAppointment: "Randevu seçin...",
    totalAmount: "Toplam",
  },
};

export default function OrdersScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [payments, setPayments] = useState<AppointmentPaymentItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    appointmentId: 0, amount: 0, currencyId: 0, paymentMethod: "Cash", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await paymentService.list(Object.keys(params).length > 0 ? params : undefined);
      if (res.data.success && res.data.data) setPayments(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Ödemeler yüklenemedi" : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, language]);

  const fetchFormData = useCallback(async () => {
    try {
      const [apptRes, currRes] = await Promise.all([
        appointmentService.list(),
        currencyService.list(),
      ]);
      if (apptRes.data.success && apptRes.data.data) setAppointments(apptRes.data.data);
      if (currRes.data.success && currRes.data.data) setCurrencies(currRes.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchFormData(); }, [fetchFormData]);

  const openCreate = () => {
    setForm({
      appointmentId: 0,
      amount: 0,
      currencyId: currencies.find((c) => c.isDefault)?.id || currencies[0]?.id || 0,
      paymentMethod: "Cash",
      notes: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.appointmentId || form.amount <= 0) return;
    setSaving(true);
    try {
      await paymentService.create({
        appointmentId: form.appointmentId,
        amount: form.amount,
        currencyId: form.currencyId,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
      });
      toast.success(language === "tr" ? "Ödeme kaydedildi" : "Payment recorded");
      setShowModal(false);
      fetchPayments();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(text.deleteConfirm)) return;
    try {
      await paymentService.delete(id);
      toast.success(language === "tr" ? "Ödeme silindi" : "Payment deleted");
      fetchPayments();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  const totalTry = payments.reduce((sum, p) => sum + p.amountInTry, 0);

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {text.title} <span className="text-white/40">({payments.length})</span>
        </h1>
        <div className="flex items-center gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none" />
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]">
            + {text.new}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
        {loading ? (
          <div className="p-8 text-center text-white/60">{text.loading}</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <table className="w-full text-left text-[10px] md:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                {text.headers.map((h, i) => <th key={i} className="px-3 py-3 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <tr key={p.id} className="transition hover:bg-white/5">
                  <td className="px-3 py-3 text-white/60">#{p.appointmentId}</td>
                  <td className="px-3 py-3 font-medium text-white">{fmt(p.amount)} {p.currencySymbol}</td>
                  <td className="px-3 py-3 text-white/60">{p.currencyCode}</td>
                  <td className="px-3 py-3 text-white/60">{fmt(p.amountInTry)} TRY</td>
                  <td className="px-3 py-3 text-white/60">
                    {PAYMENT_METHOD_LABELS[p.paymentMethod]?.[language] || p.paymentMethod}
                  </td>
                  <td className="px-3 py-3 text-white/60">{formatDate(p.paidAt)}</td>
                  <td className="px-3 py-3 text-white/60 max-w-[150px] truncate">{p.notes || "—"}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => handleDelete(p.id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-white shadow hover:bg-[#dc2626]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="border-t border-white/10 bg-white/5 p-3 flex justify-between text-[10px] font-medium text-white/60">
          <span>{text.recordCount}: {payments.length}</span>
          <span>{text.totalAmount}: {fmt(totalTry)} TRY</span>
        </div>
      </div>

      {/* Create Payment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={text.modalCreate}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.appointment} *</label>
            <select value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: Number(e.target.value) })} required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none">
              <option value={0} className="bg-[#1a1a2e]">{text.selectAppointment}</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#1a1a2e]">
                  #{a.id} — {a.customerName} {a.customerSurname} — {a.treatmentName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.amount} *</label>
              <input type="number" min={0} step={0.01} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.currency}</label>
              <select value={form.currencyId} onChange={(e) => setForm({ ...form, currencyId: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none">
                {currencies.map((c) => <option key={c.id} value={c.id} className="bg-[#1a1a2e]">{c.code} ({c.symbol})</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.paymentMethod}</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-[#1a1a2e]">{PAYMENT_METHOD_LABELS[m]?.[language] || m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.notes}</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50">
              {saving ? text.saving : text.save}
            </button>
            <button type="button" onClick={() => setShowModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5">
              {text.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

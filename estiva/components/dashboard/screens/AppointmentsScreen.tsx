"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { appointmentService } from "@/services/appointmentService";
import { customerService } from "@/services/customerService";
import { treatmentService } from "@/services/treatmentService";
import { notificationService } from "@/services/notificationService";
import type {
  AppointmentListItem,
  CustomerListItem,
  TreatmentListItem,
} from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const STATUS_MAP: Record<number, { en: string; tr: string; color: string }> = {
  1: { en: "Scheduled", tr: "Planlandı", color: "bg-blue-500/10 text-blue-400" },
  2: { en: "Confirmed", tr: "Onaylandı", color: "bg-green-500/10 text-green-400" },
  3: { en: "Completed", tr: "Tamamlandı", color: "bg-emerald-500/10 text-emerald-400" },
  4: { en: "Cancelled", tr: "İptal", color: "bg-red-500/10 text-red-400" },
  5: { en: "No Show", tr: "Gelmedi", color: "bg-yellow-500/10 text-yellow-400" },
};

const copy = {
  en: {
    title: "Appointments",
    new: "New Appointment",
    headers: [
      "Client", "Treatment", "Staff", "Date", "Time", "Status", "Recurring", "",
    ],
    recordCount: "Total record count",
    loading: "Loading...",
    noData: "No appointments found.",
    modalCreate: "New Appointment",
    customer: "Customer",
    treatment: "Treatment",
    staffId: "Staff ID",
    startTime: "Date & Time",
    notes: "Notes",
    recurring: "Recurring",
    interval: "Interval (days)",
    sessions: "Total Sessions",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    selectCustomer: "Select customer...",
    selectTreatment: "Select treatment...",
    statusUpdate: "Update Status",
    yes: "Yes",
    no: "No",
    allStatuses: "All Statuses",
    filterDate: "Filter by date",
  },
  tr: {
    title: "Randevular",
    new: "Yeni Randevu",
    headers: [
      "Müşteri", "Hizmet", "Personel", "Tarih", "Saat", "Durum", "Tekrarlayan", "",
    ],
    recordCount: "Toplam kayıt sayısı",
    loading: "Yükleniyor...",
    noData: "Randevu bulunamadı.",
    modalCreate: "Yeni Randevu",
    customer: "Müşteri",
    treatment: "Hizmet",
    staffId: "Personel ID",
    startTime: "Tarih & Saat",
    notes: "Notlar",
    recurring: "Tekrarlayan",
    interval: "Aralık (gün)",
    sessions: "Toplam Seans",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    selectCustomer: "Müşteri seçin...",
    selectTreatment: "Hizmet seçin...",
    statusUpdate: "Durum Güncelle",
    yes: "Evet",
    no: "Hayır",
    allStatuses: "Tüm Durumlar",
    filterDate: "Tarih filtrele",
  },
};

interface CreateForm {
  customerId: number;
  staffId: number;
  treatmentId: number;
  startTime: string;
  notes: string;
  isRecurring: boolean;
  recurrenceIntervalDays: number;
  totalSessions: number;
}

const emptyForm: CreateForm = {
  customerId: 0,
  staffId: 0,
  treatmentId: 0,
  startTime: "",
  notes: "",
  isRecurring: false,
  recurrenceIntervalDays: 7,
  totalSessions: 1,
};

export default function AppointmentsScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<number | "">("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetId, setStatusTargetId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState(1);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (dateFilter) {
        params.startDate = dateFilter;
        params.endDate = dateFilter;
      }
      const res = await appointmentService.list(
        Object.keys(params).length > 0 ? params as { startDate?: string; endDate?: string } : undefined,
      );
      if (res.data.success && res.data.data) {
        let filtered = res.data.data;
        if (statusFilter !== "") {
          filtered = filtered.filter((a) => a.status === statusFilter);
        }
        setAppointments(filtered);
      }
    } catch {
      toast.error(language === "tr" ? "Randevular yüklenemedi" : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, language]);

  const fetchFormData = useCallback(async () => {
    try {
      const [custRes, treatRes] = await Promise.all([
        customerService.list(),
        treatmentService.list(),
      ]);
      if (custRes.data.success && custRes.data.data) setCustomers(custRes.data.data);
      if (treatRes.data.success && treatRes.data.data) setTreatments(treatRes.data.data);
    } catch {
      // silent — form dropdowns will be empty
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const openCreate = () => {
    setForm(emptyForm);
    setShowCreate(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.treatmentId || !form.startTime) return;

    setSaving(true);
    try {
      await appointmentService.create({
        customerId: form.customerId,
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

  const openStatusUpdate = (id: number, currentStatus: number) => {
    setStatusTargetId(id);
    setNewStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusTargetId) return;
    try {
      await appointmentService.updateStatus(statusTargetId, { status: newStatus });
      toast.success(language === "tr" ? "Durum güncellendi" : "Status updated");
      setShowStatusModal(false);
      fetchAppointments();
    } catch {
      toast.error(language === "tr" ? "Güncelleme başarısız" : "Update failed");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(language === "tr" ? "Randevuyu iptal etmek istediğinize emin misiniz?" : "Cancel this appointment?")) return;
    try {
      await appointmentService.cancel(id);
      toast.success(language === "tr" ? "Randevu iptal edildi" : "Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error(language === "tr" ? "İptal başarısız" : "Cancel failed");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {text.title}{" "}
            <span className="text-white/40">({appointments.length})</span>
          </h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="" className="bg-[#1a1a1a]">{text.allStatuses}</option>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key} className="bg-[#1a1a1a]">
                {language === "tr" ? val.tr : val.en}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]"
        >
          + {text.new}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
        {loading ? (
          <div className="p-8 text-center text-white/60">{text.loading}</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <table className="w-full text-left text-[10px] md:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                {text.headers.map((label, i) => (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {appointments.map((apt) => {
                const status = STATUS_MAP[apt.status] || STATUS_MAP[1];
                return (
                  <tr key={apt.id} className="group transition hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {apt.customerName} {apt.customerSurname}
                    </td>
                    <td className="px-4 py-3 text-white/60">{apt.treatmentName}</td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                      {apt.staffName} {apt.staffSurname}
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                      {formatDate(apt.startTime)}
                    </td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openStatusUpdate(apt.id, apt.status)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold cursor-pointer hover:opacity-80 ${status.color}`}
                      >
                        {language === "tr" ? status.tr : status.en}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {apt.isRecurring
                        ? `${text.yes} (${apt.sessionNumber}/${apt.totalSessions})`
                        : text.no}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={async () => {
                            try {
                              const res = await notificationService.sendReminder(apt.id);
                              if (res.data.success) {
                                toast.success(res.data.data?.message || (language === "tr" ? "Hatırlatma gönderildi" : "Reminder sent"));
                              } else {
                                toast.error(res.data.error?.message || (language === "tr" ? "Gönderilemedi" : "Failed"));
                              }
                            } catch {
                              toast.error(language === "tr" ? "Gönderilemedi" : "Failed to send");
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded bg-[#25D366] text-white shadow hover:bg-[#1da851]"
                          title={language === "tr" ? "WhatsApp Hatırlatma" : "WhatsApp Reminder"}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-white shadow hover:bg-[#dc2626]"
                          title={language === "tr" ? "İptal Et" : "Cancel"}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
          {text.recordCount}: {appointments.length}
        </div>
      </div>

      {/* Create Appointment Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={text.modalCreate}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.customer} *</label>
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                <option value={0} className="bg-[#1a1a2e]">{text.selectCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a2e]">
                    {c.name} {c.surname}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.treatment} *</label>
              <select
                value={form.treatmentId}
                onChange={(e) => setForm({ ...form, treatmentId: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                <option value={0} className="bg-[#1a1a2e]">{text.selectTreatment}</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#1a1a2e]">
                    {t.name} ({t.durationMinutes}dk - {t.price}TRY)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.staffId}</label>
              <input
                type="number"
                value={form.staffId || ""}
                onChange={(e) => setForm({ ...form, staffId: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.startTime} *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none resize-none"
            />
          </div>

          {/* Recurring */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                className="rounded"
              />
              {text.recurring}
            </label>
            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/60">{text.interval}</label>
                  <input
                    type="number"
                    min={1}
                    value={form.recurrenceIntervalDays}
                    onChange={(e) => setForm({ ...form, recurrenceIntervalDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/60">{text.sessions}</label>
                  <input
                    type="number"
                    min={2}
                    value={form.totalSessions}
                    onChange={(e) => setForm({ ...form, totalSessions: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50"
            >
              {saving ? text.saving : text.save}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              {text.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={text.statusUpdate}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setNewStatus(Number(key))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  newStatus === Number(key)
                    ? val.color + " ring-2 ring-white/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {language === "tr" ? val.tr : val.en}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStatusUpdate}
              className="flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45]"
            >
              {text.save}
            </button>
            <button
              onClick={() => setShowStatusModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              {text.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { customerService } from "@/services/customerService";
import { customerSchema, getValidationMessage } from "@/lib/validations";
import type { CustomerListItem, CustomerDetail } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Customers",
    filter: "Filter",
    sort: "Filter / Sort",
    search: "Search...",
    new: "New",
    headers: ["Client", "Phone", "Email", "Registered", "Notes", ""],
    recordCount: "Total record count",
    loading: "Loading...",
    noData: "No customers found.",
    // Modal
    modalCreate: "New Customer",
    modalEdit: "Edit Customer",
    modalDetail: "Customer Details",
    name: "Name",
    surname: "Surname",
    phone: "Phone",
    email: "Email",
    birthDate: "Birth Date",
    notes: "Notes",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this customer?",
    lastAppointments: "Last Appointments",
  },
  tr: {
    title: "Müşteriler",
    filter: "Filtrele",
    sort: "Filtrele / Sırala",
    search: "Ara...",
    new: "Yeni",
    headers: ["Müşteri", "Telefon", "E-posta", "Kayıt Tarihi", "Notlar", ""],
    recordCount: "Toplam kayıt sayısı",
    loading: "Yükleniyor...",
    noData: "Müşteri bulunamadı.",
    // Modal
    modalCreate: "Yeni Müşteri",
    modalEdit: "Müşteri Düzenle",
    modalDetail: "Müşteri Detayı",
    name: "Ad",
    surname: "Soyad",
    phone: "Telefon",
    email: "E-posta",
    birthDate: "Doğum Tarihi",
    notes: "Notlar",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    delete: "Sil",
    deleteConfirm: "Bu müşteriyi silmek istediğinize emin misiniz?",
    lastAppointments: "Son Randevular",
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

const emptyForm: FormData = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  birthDate: "",
  notes: "",
};

export default function CustomersScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "detail">("create");
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerService.list(search || undefined);
      if (res.data.success && res.data.data) {
        setCustomers(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Müşteriler yüklenemedi" : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, language]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
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
        setModalMode("edit");
        setShowModal(true);
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
        setModalMode("detail");
        setShowModal(true);
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

      if (modalMode === "edit" && editingId) {
        await customerService.update(editingId, payload);
        toast.success(language === "tr" ? "Müşteri güncellendi" : "Customer updated");
      } else {
        await customerService.create(payload);
        toast.success(language === "tr" ? "Müşteri oluşturuldu" : "Customer created");
      }
      setShowModal(false);
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(text.deleteConfirm)) return;
    try {
      await customerService.delete(id);
      toast.success(language === "tr" ? "Müşteri silindi" : "Customer deleted");
      fetchCustomers();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {text.title}{" "}
            <span className="text-white/40">({customers.length})</span>
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]"
        >
          + {text.new}
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={text.search}
          className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
        {loading ? (
          <div className="p-8 text-center text-white/60">{text.loading}</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <table className="w-full text-left text-[10px] md:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                {text.headers.map((label, i) => (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="group transition hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                    {customer.name} {customer.surname}
                  </td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {customer.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {formatDate(customer.cDate)}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[200px] truncate">
                    {customer.notes || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(customer.id)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#3b82f6] text-white shadow hover:bg-[#2563eb]"
                        title={language === "tr" ? "Detay" : "Detail"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button
                        onClick={() => openEdit(customer.id)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#f59e0b] text-white shadow hover:bg-[#d97706]"
                        title={language === "tr" ? "Düzenle" : "Edit"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-white shadow hover:bg-[#dc2626]"
                        title={language === "tr" ? "Sil" : "Delete"}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
          {text.recordCount}: {customers.length}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal && (modalMode === "create" || modalMode === "edit")}
        onClose={() => setShowModal(false)}
        title={modalMode === "create" ? text.modalCreate : text.modalEdit}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.name} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${fieldErrors.name ? "border-red-500" : "border-white/10 focus:border-white/30"}`}
              />
              {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.surname} *</label>
              <input
                type="text"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${fieldErrors.surname ? "border-red-500" : "border-white/10 focus:border-white/30"}`}
              />
              {fieldErrors.surname && <p className="text-xs text-red-500">{fieldErrors.surname}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.phone} *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${fieldErrors.phone ? "border-red-500" : "border-white/10 focus:border-white/30"}`}
              />
              {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${fieldErrors.email ? "border-red-500" : "border-white/10 focus:border-white/30"}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.birthDate}</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none resize-none"
            />
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
              onClick={() => setShowModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
            >
              {text.cancel}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={showModal && modalMode === "detail"}
        onClose={() => setShowModal(false)}
        title={text.modalDetail}
      >
        {selectedDetail && (
          <div className="space-y-4 text-sm text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/50">{text.name}</p>
                <p className="font-medium">{selectedDetail.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">{text.surname}</p>
                <p className="font-medium">{selectedDetail.surname}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">{text.phone}</p>
                <p>{selectedDetail.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">{text.email}</p>
                <p>{selectedDetail.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">{text.birthDate}</p>
                <p>{formatDate(selectedDetail.birthDate)}</p>
              </div>
            </div>
            {selectedDetail.notes && (
              <div>
                <p className="text-xs text-white/50">{text.notes}</p>
                <p className="text-white/80">{selectedDetail.notes}</p>
              </div>
            )}
            {selectedDetail.lastAppointments?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-white/50">{text.lastAppointments}</p>
                <div className="space-y-2">
                  {selectedDetail.lastAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{apt.treatmentName}</span>
                        <span className="text-white/50">
                          {new Date(apt.startTime).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <span className="text-white/40">{apt.statusText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

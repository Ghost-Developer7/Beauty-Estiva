"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { treatmentService } from "@/services/treatmentService";
import type { TreatmentListItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

const copy = {
  en: {
    title: "Treatments",
    new: "New",
    headers: ["Name", "Duration", "Price", "Color", ""],
    recordCount: "Total record count",
    loading: "Loading...",
    noData: "No treatments found.",
    modalCreate: "New Treatment",
    modalEdit: "Edit Treatment",
    name: "Name",
    description: "Description",
    duration: "Duration (min)",
    price: "Price (TRY)",
    color: "Color",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    deleteConfirm: "Are you sure you want to delete this treatment?",
    min: "min",
  },
  tr: {
    title: "Hizmetler",
    new: "Yeni",
    headers: ["Hizmet Adı", "Süre", "Fiyat", "Renk", ""],
    recordCount: "Toplam kayıt sayısı",
    loading: "Yükleniyor...",
    noData: "Hizmet bulunamadı.",
    modalCreate: "Yeni Hizmet",
    modalEdit: "Hizmet Düzenle",
    name: "Hizmet Adı",
    description: "Açıklama",
    duration: "Süre (dk)",
    price: "Fiyat (TRY)",
    color: "Renk",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    deleteConfirm: "Bu hizmeti silmek istediğinize emin misiniz?",
    min: "dk",
  },
};

interface FormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  color: string;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: 0,
  color: COLORS[0],
};

export default function TreatmentsScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [treatments, setTreatments] = useState<TreatmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTreatments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await treatmentService.list();
      if (res.data.success && res.data.data) {
        setTreatments(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Hizmetler yüklenemedi" : "Failed to load treatments");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEdit = async (item: TreatmentListItem) => {
    setForm({
      name: item.name,
      description: item.description || "",
      durationMinutes: item.durationMinutes,
      price: item.price,
      color: item.color || COLORS[0],
    });
    setEditingId(item.id);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.durationMinutes || form.price < 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        durationMinutes: form.durationMinutes,
        price: form.price,
        color: form.color || undefined,
      };

      if (modalMode === "edit" && editingId) {
        await treatmentService.update(editingId, payload);
        toast.success(language === "tr" ? "Hizmet güncellendi" : "Treatment updated");
      } else {
        await treatmentService.create(payload);
        toast.success(language === "tr" ? "Hizmet oluşturuldu" : "Treatment created");
      }
      setShowModal(false);
      fetchTreatments();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(text.deleteConfirm)) return;
    try {
      await treatmentService.delete(id);
      toast.success(language === "tr" ? "Hizmet silindi" : "Treatment deleted");
      fetchTreatments();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {text.title}{" "}
          <span className="text-white/40">({treatments.length})</span>
        </h1>
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
        ) : treatments.length === 0 ? (
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
              {treatments.map((item) => (
                <tr key={item.id} className="group transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-white/60">
                    {item.durationMinutes} {text.min}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {item.price.toLocaleString("tr-TR")} TRY
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: item.color || "#666" }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#f59e0b] text-white shadow hover:bg-[#d97706]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-white shadow hover:bg-[#dc2626]"
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
          {text.recordCount}: {treatments.length}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "create" ? text.modalCreate : text.modalEdit}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.name} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.description}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.duration} *</label>
              <input
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.price} *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.color}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    form.color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
    </div>
  );
}

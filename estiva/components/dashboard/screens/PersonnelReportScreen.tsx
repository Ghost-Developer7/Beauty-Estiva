"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { staffScheduleService } from "@/services/staffScheduleService";
import { staffService, type StaffMember } from "@/services/staffService";
import type { StaffUnavailabilityListItem } from "@/types/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Staff Schedule",
    tabs: ["Unavailabilities", "Add Unavailability"],
    headers: ["Staff", "Start", "End", "Reason", "Notes", ""],
    loading: "Loading...",
    noData: "No unavailabilities found.",
    recordCount: "Total",
    staffId: "Staff",
    selectStaff: "Select staff member...",
    startDate: "Start Date",
    endDate: "End Date",
    filter: "Search",
    // Modal
    modalCreate: "Add Unavailability",
    startTime: "Start Time",
    endTime: "End Time",
    reason: "Reason",
    notes: "Notes",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    deleteConfirm: "Delete this unavailability?",
    reasonOptions: ["Leave", "Break", "Meeting", "Training", "Other"],
  },
  tr: {
    title: "Personel Programı",
    tabs: ["İzinler / Müsait Olmama", "İzin Ekle"],
    headers: ["Personel", "Başlangıç", "Bitiş", "Neden", "Notlar", ""],
    loading: "Yükleniyor...",
    noData: "Müsait olmama kaydı bulunamadı.",
    recordCount: "Toplam",
    staffId: "Personel",
    selectStaff: "Personel seçin...",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    filter: "Ara",
    modalCreate: "Müsait Olmama Ekle",
    startTime: "Başlangıç Zamanı",
    endTime: "Bitiş Zamanı",
    reason: "Neden",
    notes: "Notlar",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    deleteConfirm: "Bu kaydı silmek istiyor musunuz?",
    reasonOptions: ["İzin", "Mola", "Toplantı", "Eğitim", "Diğer"],
  },
};

export default function PersonnelReportScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  const [items, setItems] = useState<StaffUnavailabilityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffIdFilter, setStaffIdFilter] = useState<number>(0);
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    startTime: "", endTime: "", reason: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!staffIdFilter) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startFilter) params.startDate = startFilter;
      if (endFilter) params.endDate = endFilter;
      const res = await staffScheduleService.listUnavailability(
        staffIdFilter,
        Object.keys(params).length > 0 ? params : undefined,
      );
      if (res.data.success && res.data.data) setItems(res.data.data);
    } catch {
      toast.error(language === "tr" ? "Veriler yüklenemedi" : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [staffIdFilter, startFilter, endFilter, language]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    staffService.list().then((res) => {
      if (res.data.success && res.data.data) setStaffList(res.data.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      await staffScheduleService.createUnavailability({
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason || undefined,
        notes: form.notes || undefined,
      });
      toast.success(language === "tr" ? "Kayıt oluşturuldu" : "Created successfully");
      setShowModal(false);
      setForm({ startTime: "", endTime: "", reason: "", notes: "" });
      fetchData();
    } catch {
      toast.error(language === "tr" ? "İşlem başarısız" : "Operation failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(text.deleteConfirm)) return;
    try {
      await staffScheduleService.deleteUnavailability(id);
      toast.success(language === "tr" ? "Silindi" : "Deleted");
      fetchData();
    } catch {
      toast.error(language === "tr" ? "Silme başarısız" : "Delete failed");
    }
  };

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]">
          + {text.tabs[1]}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="space-y-1">
          <label className="text-[10px] text-white/40">{text.staffId}</label>
          <select
            value={staffIdFilter || ""}
            onChange={(e) => setStaffIdFilter(Number(e.target.value))}
            className="min-w-[180px] rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="" className="bg-[#1a1a2e]">{text.selectStaff}</option>
            {staffList.filter(s => s.isActive).map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1a1a2e]">
                {s.name} {s.surname}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40">{text.startDate}</label>
          <input type="date" value={startFilter} onChange={(e) => setStartFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/40">{text.endDate}</label>
          <input type="date" value={endFilter} onChange={(e) => setEndFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {!staffIdFilter ? (
          <div className="p-8 text-center text-white/40">
            {language === "tr" ? "Personel seçerek arama yapın" : "Select a staff member to search"}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-white/60">{text.loading}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-white/60">{text.noData}</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                {text.headers.map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{item.staffName}</td>
                  <td className="px-4 py-3 text-white/60">{formatDateTime(item.startTime)}</td>
                  <td className="px-4 py-3 text-white/60">{formatDateTime(item.endTime)}</td>
                  <td className="px-4 py-3 text-white/60">{item.reason || "—"}</td>
                  <td className="px-4 py-3 text-white/60 max-w-[200px] truncate">{item.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-white shadow hover:bg-[#dc2626]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
          {text.recordCount}: {items.length}
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={text.modalCreate}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.startTime} *</label>
              <input type="datetime-local" required value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.endTime} *</label>
              <input type="datetime-local" required value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.reason}</label>
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none">
              <option value="" className="bg-[#1a1a2e]">—</option>
              {text.reasonOptions.map((r) => <option key={r} value={r} className="bg-[#1a1a2e]">{r}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">{text.notes}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none resize-none" />
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

"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const copy = {
    en: {
        title: "Debts",
        timeRange: "All time",
        placeholder: "Search",
        newButton: "New",
        download: "Download",
        table: {
            cols: ["Person", "Amount", "Planned payment date", "Created"],
            empty: "Total amount: 0 TRY"
        },
        modal: {
            title: "New Debt",
            person: "Person",
            personPh: "Enter person name",
            amount: "Amount (TL)",
            amountPh: "0.00",
            date: "Planned Payment Date",
            notes: "Notes",
            notesPh: "Optional notes...",
            save: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            success: "Debt entry created.",
            error: "Could not create debt entry.",
            personRequired: "Person name is required.",
            amountRequired: "Amount is required.",
        }
    },
    tr: {
        title: "Borçlar",
        timeRange: "Tüm zamanlar",
        placeholder: "Ara",
        newButton: "Yeni",
        download: "İndir",
        table: {
            cols: ["Kişi", "Tutar", "Planlanan ödeme tarihi", "Oluşturulma"],
            empty: "Toplam tutar: 0 TRY"
        },
        modal: {
            title: "Yeni Borç",
            person: "Kişi",
            personPh: "Kişi adı girin",
            amount: "Tutar (TL)",
            amountPh: "0.00",
            date: "Planlanan Ödeme Tarihi",
            notes: "Notlar",
            notesPh: "İsteğe bağlı notlar...",
            save: "Kaydet",
            saving: "Kaydediliyor...",
            cancel: "İptal",
            success: "Borç kaydı oluşturuldu.",
            error: "Borç kaydı oluşturulamadı.",
            personRequired: "Kişi adı zorunludur.",
            amountRequired: "Tutar zorunludur.",
        }
    },
};

export default function DebtsScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        person: "",
        amount: "",
        plannedDate: "",
        notes: "",
    });

    const resetForm = () => {
        setForm({ person: "", amount: "", plannedDate: "", notes: "" });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.person.trim()) {
            toast.error(text.modal.personRequired);
            return;
        }
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error(text.modal.amountRequired);
            return;
        }
        setSaving(true);
        try {
            // TODO: integrate with actual debt service when API is available
            await new Promise((r) => setTimeout(r, 500));
            toast.success(text.modal.success);
            setShowModal(false);
            resetForm();
        } catch {
            toast.error(text.modal.error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 text-white h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="flex items-center gap-2">
                    <div className="relative min-w-[120px]">
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.timeRange}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-green-500"
                    >
                        <span className="text-lg leading-none">+</span> {text.newButton}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder={text.placeholder}
                    className="w-full md:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />

                <div className="flex gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-lg hover:bg-[#2563eb] text-sm">
                        ⚙
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-lg hover:bg-[#2563eb] text-xs">
                        ↻
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-2 text-sm font-medium text-white shadow-lg  hover:bg-[#2563eb]">
                        📄 {text.download}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-xs font-semibold text-white/60">
                            <tr>
                                {text.table.cols.map((col, i) => (
                                    <th key={i} className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                                            {col}
                                            <span className="opacity-50 text-[10px]">▼</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="bg-white/[0.02]">
                                <td colSpan={4} className="px-6 py-4 font-bold text-white/60">
                                    {text.table.empty}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Debt Modal */}
            <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={text.modal.title}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60">{text.modal.person} *</label>
                        <input
                            type="text"
                            required
                            value={form.person}
                            onChange={(e) => setForm({ ...form, person: e.target.value })}
                            placeholder={text.modal.personPh}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60">{text.modal.amount} *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder={text.modal.amountPh}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60">{text.modal.date}</label>
                        <input
                            type="date"
                            value={form.plannedDate}
                            onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-white/60">{text.modal.notes}</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            placeholder={text.modal.notesPh}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-xl bg-[#00a651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f45] disabled:opacity-50"
                        >
                            {saving ? text.modal.saving : text.modal.save}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); resetForm(); }}
                            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
                        >
                            {text.modal.cancel}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

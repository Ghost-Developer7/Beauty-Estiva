"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
    en: {
        title: "Receivables",
        dateCreated: "Date created",
        allTime: "All time",
        placeholder: "Search",
        newButton: "New",
        download: "Download",
        import: "Import",
        table: {
            cols: ["Customer", "Phone", "Service", "Type", "Amount", "Planned payment date", "Created"],
            empty: "Total amount: 0 TL"
        }
    },
    tr: {
        title: "Alacaklar",
        dateCreated: "Oluşturulma tarihi",
        allTime: "Tüm zamanlar",
        placeholder: "Ara",
        newButton: "Yeni",
        download: "İndir",
        import: "İçe aktar",
        table: {
            cols: ["Müşteri", "Telefon", "Hizmet", "Tip", "Tutar", "Planlanan ödeme tarihi", "Oluşturulma"],
            empty: "Toplam tutar: 0 TL"
        }
    },
};

export default function ReceivablesScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    return (
        <div className="space-y-6 text-white h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="flex items-center gap-2">
                    <div className="relative min-w-[150px]">
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.dateCreated}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                    <div className="relative min-w-[120px]">
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.allTime}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                    <button className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-green-500">
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
                    <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-2 py-2 text-sm font-medium text-white shadow-lg  hover:bg-[#2563eb]">
                        📄 {text.download} ▾
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-2 py-2 text-sm font-medium text-white shadow-lg  hover:bg-[#374151]">
                        ↥ {text.import} ▾
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-xs font-semibold uppercase text-white/60">
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
                                <td colSpan={7} className="px-6 py-4 font-bold text-white/60">
                                    {text.table.empty}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
